using Dapper;
using MySqlConnector;

namespace PocketSqlApi.Commands.SqlFiles.UploadFile;

public class UploadFileCommandHandler
{
    private readonly string _connectionString;

    public UploadFileCommandHandler(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<string> Handle(UploadFileCommand command)
    {
        try
        {
            string sqlContent = command.Sql;
            string fileName = command.FileName;

            if (string.IsNullOrWhiteSpace(sqlContent))
            {
                throw new SystemException("File is empty");
            }

            var builder = new MySqlConnectionStringBuilder(_connectionString)
            {
                Database = command.DatabaseName
            };

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            // Ensure the table exists
            var createTableQuery = @"
                CREATE TABLE IF NOT EXISTS SqlFiles (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    SqlText TEXT NOT NULL,
                    FileName TEXT NOT NULL,
                    CreatedDateTime DATETIME NOT NULL,
                    ModifiedDateTime DATETIME NULL
                );
            ";
            
            await conn.ExecuteAsync(createTableQuery);

            // Insert SQL text with timestamps
            var insertQuery = @"
                INSERT INTO SqlFiles (SqlText, FileName CreatedDateTime, ModifiedDateTime)
                VALUES (@SqlText, @FileName, @CreatedDateTime, @ModifiedDateTime);
            ";

            await conn.ExecuteAsync(insertQuery, new
            {
                SqlText = sqlContent,
                FileName = fileName,
                CreatedDateTime = DateTime.UtcNow,
                ModifiedDateTime = DateTime.UtcNow
            });

            return "SQL file saved successfully.";
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }
}