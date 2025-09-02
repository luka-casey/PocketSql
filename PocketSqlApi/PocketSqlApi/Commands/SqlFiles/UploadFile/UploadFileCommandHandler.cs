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

    public async Task Handle(UploadFileCommand command)
    {
        if (command == null)
            throw new ArgumentNullException(nameof(command));

        string sqlContent = command.Request.Sql;
        string fileName = command.Request.FileName;

        if (string.IsNullOrWhiteSpace(sqlContent))
            throw new ArgumentException("SQL file content cannot be empty.", nameof(command.Request.Sql));

        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name cannot be empty.", nameof(command.Request.FileName));

        try
        {
            var builder = new MySqlConnectionStringBuilder(_connectionString)
            {
                Database = command.Request.DatabaseName
            };

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            // Ensure the table exists
            var createTableQuery = @"
                CREATE TABLE IF NOT EXISTS SqlFiles (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    SqlText TEXT NOT NULL,
                    FileName VARCHAR(255) NOT NULL,
                    CreatedDateTime DATETIME NOT NULL,
                    ModifiedDateTime DATETIME NULL
                );
            ";

            await conn.ExecuteAsync(createTableQuery);

            // Insert SQL text with CreatedDateTime, ModifiedDateTime = NULL
            var insertQuery = @"
                INSERT INTO SqlFiles (SqlText, FileName, CreatedDateTime, ModifiedDateTime)
                VALUES (@SqlText, @FileName, @CreatedDateTime, @ModifiedDateTime);
            ";

            await conn.ExecuteAsync(insertQuery, new
            {
                SqlText = sqlContent,
                FileName = fileName,
                CreatedDateTime = DateTime.UtcNow,
                ModifiedDateTime = (DateTime?)null
            });
        }
        catch (MySqlException dbEx)
        {
            // Handle database-specific issues
            throw new InvalidOperationException("A database error occurred while saving the SQL file.", dbEx);
        }
        catch (Exception ex)
        {
            // General catch-all
            throw new ApplicationException("An unexpected error occurred while saving the SQL file.", ex);
        }
    }
}
