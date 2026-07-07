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
            {
                return SqlQueryResult.Fail("SQL query cannot be empty.");
            }

            var builder = new MySqlConnectionStringBuilder(_connectionString)
            {
                Database = query.Request.DatabaseName
            };

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            var rows = (await conn.QueryAsync(sql)).ToList();
            var isViewOrProcChange = IsViewOrProcChange(sql);

            if (isViewOrProcChange)
            {
                await ProcessViewOrStoredProcChange(sql, query.Request.DatabaseName);
            }

            if (rows.Any())
            {
                return SqlQueryResult.Ok(rows);
            }

            return SqlQueryResult.Ok(new
            {
                message = "Query executed successfully.",
                rowsAffected = rows is null ? 0 : rows.Count
            });
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
        var (action, type, objectName) = GetSchemaChangeMetadata(sql);

        switch (action, type)
        {
            case (SqlActionEnum.Create, SqlObjectTypeEnum.View):
                await CreateFile(sql, databaseName, objectName, "View");
                break;

            case (SqlActionEnum.CreateOrReplace, SqlObjectTypeEnum.View):
            case (SqlActionEnum.CreateOrReplace, SqlObjectTypeEnum.Procedure):
                await CreateOrReplaceFile(sql, databaseName, objectName, type == SqlObjectTypeEnum.View ? "View" : "Proc");
                break;

            case (SqlActionEnum.Alter, SqlObjectTypeEnum.View):
            case (SqlActionEnum.Alter, SqlObjectTypeEnum.Procedure):
                await AlterFile(sql, databaseName, objectName);
                break;

            case (SqlActionEnum.Drop, SqlObjectTypeEnum.View):
            case (SqlActionEnum.Drop, SqlObjectTypeEnum.Procedure):
                await DropFile(databaseName, objectName);
                break;

            default:
                throw new InvalidOperationException($"Unsupported schema change: {sql}");
        }
    }

    public async Task CreateFile(string sql, string databaseName, string fileName, string fileType)
    {
        var sqlFileController = new SqlFileController(_config);

        var request = new UploadFileRequest
        {
            Sql = sql,
            FileName = fileName,
            DatabaseName = databaseName,
            FileType = fileType
        };

        await sqlFileController.UploadFile(request);
    }

    public async Task CreateOrReplaceFile(string sql, string databaseName, string fileName, string fileType)
    {
        var sqlFileController = new SqlFileController(_config);
        var existingFile = await sqlFileController.GetFileByName(new GetFileByNameRequest
        {
            DatabaseName = databaseName,
            FileName = fileName
        });

        if (existingFile is null)
        {
            await CreateFile(sql, databaseName, fileName, fileType);
            return;
        }

        await sqlFileController.EditFile(new EditFileRequest
        {
            Id = existingFile.Id,
            Sql = sql,
            FileName = fileName,
            DatabaseName = databaseName
        });
    }

    public async Task AlterFile(string sql, string databaseName, string fileName)
    {
        var sqlFileController = new SqlFileController(_config);

        var existingFile = await sqlFileController.GetFileByName(new GetFileByNameRequest
        {
            DatabaseName = databaseName,
            FileName = fileName
        });

        if (existingFile is null)
        {
            throw new InvalidOperationException($"Unable to find a saved file for '{fileName}'.");
        }

        await sqlFileController.EditFile(new EditFileRequest
        {
            Id = existingFile.Id,
            Sql = sql,
            FileName = fileName,
            DatabaseName = databaseName
        });
    }

    public async Task DropFile(string databaseName, string fileName)
    {
        var sqlFileController = new SqlFileController(_config);

        await sqlFileController.DeleteFile(new DeleteFileRequest
        {
            DatabaseName = databaseName,
            FileName = fileName
        });
    }

    private static bool IsViewOrProcChange(string sql) =>
        Regex.IsMatch(
            sql,
            @"^\s*(CREATE|ALTER|DROP)\s+(OR\s+REPLACE\s+)?(VIEW|PROC(EDURE)?)",
            RegexOptions.IgnoreCase
        );

    private static (SqlActionEnum Action, SqlObjectTypeEnum Type, string ObjectName) GetSchemaChangeMetadata(string sql)
    {
        var objectName = "UNKNOWN";
        var nameMatch = Regex.Match(
            sql,
            @"^\s*(?:CREATE\s+(?:OR\s+REPLACE\s+)?|ALTER\s+|DROP\s+)?(?:VIEW|PROCEDURE|PROC)\s+`?([a-zA-Z0-9_]+)`?",
            RegexOptions.IgnoreCase
        );

        if (nameMatch.Success)
        {
            objectName = nameMatch.Groups[1].Value;
        }

        var action = Regex.IsMatch(sql, @"^\s*CREATE\s+OR\s+REPLACE\b", RegexOptions.IgnoreCase)
            ? SqlActionEnum.CreateOrReplace
            : ParseAction(sql);

        var type = Regex.IsMatch(sql, @"\bVIEW\b", RegexOptions.IgnoreCase)
            ? SqlObjectTypeEnum.View
            : Regex.IsMatch(sql, @"\b(PROCEDURE|PROC)\b", RegexOptions.IgnoreCase)
                ? SqlObjectTypeEnum.Procedure
                : SqlObjectTypeEnum.Unknown;

        return (action, type, objectName);
    }

    private static SqlActionEnum ParseAction(string sql)
    {
        var actionMatch = Regex.Match(sql, @"^\s*(CREATE|ALTER|DROP)\b", RegexOptions.IgnoreCase);

        return actionMatch.Success
            ? Enum.Parse<SqlActionEnum>(actionMatch.Groups[1].Value, true)
            : SqlActionEnum.Unknown;
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