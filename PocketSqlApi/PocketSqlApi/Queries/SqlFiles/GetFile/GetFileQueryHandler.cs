using Dapper;
using MySqlConnector;
using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlFiles.GetFile;

public class GetFileQueryHandler
{
    private readonly string _connectionString;

    public GetFileQueryHandler(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<SqlQueryResult> Handle(GetFileQuery query)
    {
        try
        {
            var builder = new MySqlConnectionStringBuilder(_connectionString)
            {
                Database = query.Database
            };

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            // Fetch the file by ID
            var sql = "SELECT Id, SqlText FROM SqlFiles WHERE Id = @Id;";
            var file = await conn.QueryFirstOrDefaultAsync(sql, new { Id = query.Id });

            if (file == null)
                return SqlQueryResult.Fail($"File with Id {query.Id} not found");

            return SqlQueryResult.Ok(file);
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
}