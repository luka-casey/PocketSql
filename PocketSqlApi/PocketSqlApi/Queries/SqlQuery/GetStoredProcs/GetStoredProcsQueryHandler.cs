using Dapper;
using MySqlConnector;
using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlQuery.GetStoredProcs;

public class GetStoredProcsQueryHandler
{
    private readonly string _connectionString;

    public GetStoredProcsQueryHandler(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<SqlQueryResult> Handle(string? schemaName = null)
    {
        try
        {
            var builder = new MySqlConnectionStringBuilder(_connectionString);

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            var sql = @"
                SELECT 
                    ROUTINE_SCHEMA AS `Schema`,
                    ROUTINE_NAME AS `Name`
                FROM information_schema.ROUTINES
                WHERE ROUTINE_TYPE = 'PROCEDURE'
                AND ROUTINE_SCHEMA NOT IN ('mysql','information_schema','performance_schema','sys')
                ";

            var parameters = new DynamicParameters();
            if (!string.IsNullOrEmpty(schemaName))
            {
                sql += " AND ROUTINE_SCHEMA = @SchemaName";
                parameters.Add("@SchemaName", schemaName);
            }

            var storedProcs = await conn.QueryAsync<(string Schema, string Name)>(sql, parameters);

            // Convert tuple to objects for JSON-friendly output
            var result = storedProcs
                .Select(sp => new { sp.Schema, sp.Name })
                .ToList();

            return SqlQueryResult.Ok(result);
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
