using Dapper;
using MySqlConnector;
using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlQuery.Execute;

public class ExecuteQueryHandler
{
    private readonly string _connectionString;

    public ExecuteQueryHandler(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<SqlQueryResult> Handle(ExecuteQuery query)
    {
        try
        {
            var sql = query.Request.Sql?.Trim();
            if (string.IsNullOrWhiteSpace(sql))
                return SqlQueryResult.Fail("SQL query cannot be empty.");

            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            if (sql.StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
            {
                var rows = await conn.QueryAsync(sql);
                return SqlQueryResult.Ok(rows);
            }
            else
            {
                var affected = await conn.ExecuteAsync(sql);
                return SqlQueryResult.Ok(new
                {
                    message = "Query executed successfully.",
                    rowsAffected = affected
                });
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
}