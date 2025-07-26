using Dapper;
using MySqlConnector;
using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlQuery.GetSchema;

public class GetSchemaQueryHandler
{
    private readonly string _connectionString;

    public GetSchemaQueryHandler(string connectionString)
    {
        _connectionString = connectionString;
    }

    /// <summary>
    /// GET /api/sqlquery/schema
    /// Fetch all tables & columns for IntelliSense
    /// </summary>
    public async Task<SqlQueryResult> Handle(GetSchemaQuery query)
    {
        try
        {
            await using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();

            // Get table names
            var tables = await conn.QueryAsync<string>(
                @"SELECT TABLE_NAME 
                  FROM INFORMATION_SCHEMA.TABLES 
                  WHERE TABLE_SCHEMA = DATABASE();"
            );

            // Get columns with types
            var columns = await conn.QueryAsync(
                @"SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
                  FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = DATABASE();"
            );

            // Combine into schema structure
            List<TableSchema> schema = tables.Select(tableName => new TableSchema
            {
                Table = tableName,
                Columns = columns
                    .Where(c => c.TABLE_NAME == tableName)
                    .Select(c => new ColumnInfo
                    {
                        ColumnName = c.COLUMN_NAME,
                        DataType = c.DATA_TYPE
                    })
                    .ToList()
            }).ToList();


            return SqlQueryResult.Ok(schema);
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