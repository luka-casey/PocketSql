using Dapper;
using MySqlConnector;
using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlFiles.GetFileByName;

public class GetFileByNameQueryHandler
{
    private readonly string _connectionString;

    public GetFileByNameQueryHandler(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<SqlFileValueData> Handle(GetFileByNameQuery query)
    {
        try
        {
            var builder = new MySqlConnectionStringBuilder(_connectionString)
            {
                Database = query.Request.DatabaseName
            };

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            // Fetch the file by ID
            var sql = "SELECT Id, SqlText, FileName, CreatedDateTime, ModifiedDateTime FROM SqlFiles WHERE FileName = @FileName;";
            var file = await conn.QueryFirstOrDefaultAsync(sql, new { FileName = query.Request.FileName });

            if (file == null)
                throw new System.Exception($"Cannot find file where FileName = {query.Request.FileName}");

            SqlFileValueData sqlFileValueData = new SqlFileValueData
            {
                Id = file.Id,
                SqlText = file.SqlText,
                FileName = file.FileName,
                DatabaseName = query.Request.DatabaseName,
                CreatedDateTime = file.CreatedDateTime,
                ModifiedDateTime = file.ModifiedDateTime
            };

            return sqlFileValueData;
        }
        catch (MySqlException ex)
        {
            throw ex;
        }
    }
}