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
            //TODO: Need to filter out commented lines. currently breaks the query
            var sql = query.Request.SqlQuery?.Trim();
            if (string.IsNullOrWhiteSpace(sql))
                return SqlQueryResult.Fail("SQL query cannot be empty.");

            var builder = new MySqlConnectionStringBuilder(_connectionString)
            {
                Database = query.Request.DatabaseName
            };

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            // Try running as a query first
            var rows = (await conn.QueryAsync(sql)).ToList();

            if (rows.Any())
            {
                return SqlQueryResult.Ok(rows);
            }
            else
            {
                // If no result rows, run as a command to get rowsAffected
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