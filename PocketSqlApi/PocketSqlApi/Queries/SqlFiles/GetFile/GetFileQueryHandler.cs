using System.Data;
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

    public async Task<SqlFileValueData> Handle(GetFileQuery query)
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
            var sql = "SELECT Id, SqlText, FileName, CreatedDateTime, ModifiedDateTime FROM SqlFiles WHERE Id = @Id;";
            var file = await conn.QueryFirstOrDefaultAsync(sql, new { Id = query.Id });

            if (file == null)
                throw new System.Exception($"Cannot find file where Id = {query.Id}");

            SqlFileValueData sqlFileValueData = new SqlFileValueData
            {
                Id = file.Id,
                SqlText = file.SqlText,
                FileName = file.FileName,
                DatabaseName = query.Database,
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