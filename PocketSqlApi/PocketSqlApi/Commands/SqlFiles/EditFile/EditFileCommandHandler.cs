using Dapper;
using MySqlConnector;
using PocketSqlApi.Models;

namespace PocketSqlApi.Commands.SqlFiles.EditFile;

public class EditFileCommandHandler
{
    private readonly string _connectionString;

    public EditFileCommandHandler(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<string> Handle(EditFileCommand command)
    {
        try
        {
            string sqlContent = command.Sql;
            if (string.IsNullOrWhiteSpace(sqlContent))
            {
                throw new SystemException("File is empty");
            }

            var builder = new MySqlConnectionStringBuilder(_connectionString)
            {
                Database = command.Database
            };

            await using var conn = new MySqlConnection(builder.ConnectionString);
            await conn.OpenAsync();

            var updateCommand = @"
                UPDATE SqlFiles 
                SET SqlText = @SqlText,
                    ModifiedDateTime = @ModifiedDateTime,
                    FileName = @FileName
                WHERE Id = @Id;
            ";

            await conn.ExecuteAsync(updateCommand, new
            {
                SqlText = sqlContent,
                ModifiedDateTime = DateTime.UtcNow,
                FileName = command.FileName,
                Id = command.ID
            });

            return "SQL file saved successfully.";
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }
}