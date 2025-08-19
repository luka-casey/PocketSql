using Dapper;
using MySqlConnector;
using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlQuery.GetDatabases;

public class GetDatabasesQueryHandler
{
    private readonly string _connectionString;

    public GetDatabasesQueryHandler(string connectionString)
    {
        _connectionString = connectionString;
    }

    /// <summary>
    /// GET /api/sqlquery/databases
    /// Fetch all non-system database names
    /// </summary>
    public async Task<SqlQueryResult> Handle()
    {
        try
        {
            var builder = new MySqlConnectionStringBuilder(_connectionString);

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            var databases = await conn.QueryAsync<string>(
                @"SELECT schema_name 
                  FROM information_schema.schemata
                  WHERE schema_name NOT IN ('information_schema','mysql','performance_schema','sys');"
            );

            return SqlQueryResult.Ok(databases.ToList());
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