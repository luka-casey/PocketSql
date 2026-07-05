using System.Text.RegularExpressions;
using Dapper;
using MySqlConnector;
using PocketSqlApi.Controllers;
using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlQuery.Execute;

public class ExecuteQueryHandler
{
    private readonly string _connectionString;
    private readonly IConfiguration _config;

    public ExecuteQueryHandler(string connectionString, IConfiguration config)
    {
        _connectionString = connectionString;
        _config = config;
    }

    public async Task<SqlQueryResult> Handle(ExecuteQuery query)
    {
        try
        {
            var sql = query.Request.SqlQuery?.Trim();
            if (string.IsNullOrWhiteSpace(sql))
                return SqlQueryResult.Fail("SQL query cannot be empty.");

            var builder = new MySqlConnectionStringBuilder(_connectionString)
            {
                Database = query.Request.DatabaseName
            };

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            var rows = (await conn.QueryAsync(sql)).ToList();

            // 🔹 NEW: handle multiple statements
            var statements = sql
                .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            //Create files for Views and Stored Procedures
            bool isViewOrStoredProc = Regex.IsMatch(
                sql,
                @"^\s*(CREATE|ALTER|DROP)\s+(OR\s+REPLACE\s+)?(VIEW|PROC(EDURE)?)",
                RegexOptions.IgnoreCase
            );

            if (isViewOrStoredProc)
            {
                foreach (var statement in statements)
                {
                    await ProcessViewOrStoredProcChange(statement, query.Request.DatabaseName);
                }
            }

            if (rows.Any())
            {
                return SqlQueryResult.Ok(rows);
            }
            else // If no result rows, run as a command to get rowsAffected
            {
                if (isViewOrStoredProc == true) // Dont want to run ExecuteAsync for stored proc because it runs it twice.
                {
                    return SqlQueryResult.Ok(new
                    {
                        message = "Query executed successfully.",
                        rowsAffected = 1
                    });
                }
                else 
                {
                    var affected = await conn.ExecuteAsync(sql); //Gets rows effected
                    return SqlQueryResult.Ok(new
                    {
                        message = "Query executed successfully.",
                        rowsAffected = affected
                    });
                }
            }
        }
        catch (MySqlException ex)
        {
            return SqlQueryResult.Fail(ex.Message, (int)ex.ErrorCode);
        }
        catch (Exception ex)
        {
            return SqlQueryResult.Fail(ex.Message);
        }
    }

    public async Task ProcessViewOrStoredProcChange(string sql, string databaseName)
    {
        SqlActionEnum action = SqlActionEnum.Unknown;

        // 🔹 Extract object name
        string objectName = "UNKNOWN";

        var nameMatch = Regex.Match(
            sql,
            @"^\s*(?:CREATE\s+(?:OR\s+REPLACE\s+)?|ALTER\s+|DROP\s+)?(?:VIEW|PROCEDURE|PROC)\s+`?([a-zA-Z0-9_]+)`?",
            RegexOptions.IgnoreCase
        );

        if (nameMatch.Success)
        {
            objectName = nameMatch.Groups[1].Value;
        }

        Console.WriteLine($"Name: {objectName}");

        // 🔹 Action detection
        if (Regex.IsMatch(sql, @"^\s*CREATE\s+OR\s+REPLACE\b", RegexOptions.IgnoreCase))
        {
            action = SqlActionEnum.CreateOrReplace;
        }
        else
        {
            var actionMatch = Regex.Match(
                sql,
                @"^\s*(CREATE|ALTER|DROP)\b",
                RegexOptions.IgnoreCase
            );

            action = actionMatch.Success
                ? Enum.Parse<SqlActionEnum>(actionMatch.Groups[1].Value, true)
                : SqlActionEnum.Unknown;
        }

        // 🔹 Type detection
        SqlObjectTypeEnum type = SqlObjectTypeEnum.Unknown;

        if (Regex.IsMatch(sql, @"\bVIEW\b", RegexOptions.IgnoreCase))
            type = SqlObjectTypeEnum.View;
        else if (Regex.IsMatch(sql, @"\b(PROCEDURE|PROC)\b", RegexOptions.IgnoreCase))
            type = SqlObjectTypeEnum.Procedure;

        Console.WriteLine($"Action: {action}");
        Console.WriteLine($"Type: {type}");

        // 🔹 Switch
        switch (action, type)
        {
            case (SqlActionEnum.Create, SqlObjectTypeEnum.View):
                Console.WriteLine("CREATE VIEW");
                await this.CreateViewFile(sql, databaseName, objectName);
                break;

            case (SqlActionEnum.CreateOrReplace, SqlObjectTypeEnum.View):
                Console.WriteLine("CREATE OR REPLACE VIEW");
                this.CreateOrReplaceViewFile();
                break;

            case (SqlActionEnum.Alter, SqlObjectTypeEnum.View):
                Console.WriteLine("ALTER VIEW");
                await this.AlterViewFile(sql, databaseName, objectName);
                break;

            case (SqlActionEnum.Drop, SqlObjectTypeEnum.View):
                Console.WriteLine("DROP VIEW");
                await this.DropViewFile(databaseName, objectName);
                break;

            case (SqlActionEnum.Create, SqlObjectTypeEnum.Procedure):
                Console.WriteLine("CREATE PROCEDURE");
                this.CreateStoredProcFile();
                break;

            case (SqlActionEnum.Alter, SqlObjectTypeEnum.Procedure):
                Console.WriteLine("ALTER PROCEDURE");
                this.AlterStoredProcFile();
                break;

            case (SqlActionEnum.Drop, SqlObjectTypeEnum.Procedure):
                Console.WriteLine("DROP PROCEDURE");
                this.DropStoredProcFile();
                break;

            default:
                Console.WriteLine("UNKNOWN CHANGE");
                throw new System.Exception();
                break;
        }
    }

    public async Task CreateViewFile(string sql, string databaseName, string fileName)
    {
        SqlFileController sqlFileController = new SqlFileController(_config);

        UploadFileRequest request = new UploadFileRequest
        {
            Sql = sql,
            FileName = fileName,
            DatabaseName = databaseName
        };

        await sqlFileController.UploadFile(request);
    }

    public void CreateOrReplaceViewFile()
    {
    }

    public async Task AlterViewFile(string sql, string databaseName, string fileName)
    {
        SqlFileController sqlFileController = new SqlFileController(_config);

        GetFileByNameRequest getFileByNameRequest = new GetFileByNameRequest
        {
            DatabaseName = databaseName,
            FileName = fileName
        };
        
        SqlFileValueData? sqlFile = await sqlFileController.GetFileByName(getFileByNameRequest);
        
        if (sqlFile is null)
        {
            throw new System.Exception();
        }

        EditFileRequest editFileRequest = new EditFileRequest
        {
            Id = sqlFile.Id,
            Sql = sql,
            FileName = fileName,
            DatabaseName = databaseName
        };

        await sqlFileController.EditFile(editFileRequest);
    }

    public async Task DropViewFile(string databaseName, string fileName)
    {

        SqlFileController sqlFileController = new SqlFileController(_config);

        DeleteFileRequest deleteFileRequest = new DeleteFileRequest()
        {
            DatabaseName = databaseName,
            FileName = fileName
        };

        await sqlFileController.DeleteFile(deleteFileRequest);
        
    }

    public void CreateStoredProcFile()
    {
    }

    public void AlterStoredProcFile()
    {
        
    }

    public void DropStoredProcFile()
    {
        
    }

    

    public enum SqlActionEnum
    {
        Unknown,
        Create,
        Alter,
        Drop,
        CreateOrReplace
    }

    public enum SqlObjectTypeEnum
    {
        Unknown,
        View,
        Procedure
    }
}