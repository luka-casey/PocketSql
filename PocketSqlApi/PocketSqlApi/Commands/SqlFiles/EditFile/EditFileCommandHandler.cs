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

    public async Task<int> Handle(EditFileCommand command)
    {
        if (command?.Request == null)
            throw new ArgumentNullException(nameof(command), "EditFileCommand cannot be null.");

        if (string.IsNullOrWhiteSpace(command.Request.Sql))
            throw new ArgumentException("SQL content cannot be empty.", nameof(command.Request.Sql));

        if (string.IsNullOrWhiteSpace(command.Request.DatabaseName))
            throw new ArgumentException("DatabaseName is required.", nameof(command.Request.DatabaseName));

        var builder = new MySqlConnectionStringBuilder(_connectionString)
        {
            Database = command.Request.DatabaseName
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

        var rowsAffected = await conn.ExecuteAsync(updateCommand, new
        {
            SqlText = command.Request.Sql,
            ModifiedDateTime = DateTime.UtcNow,
            FileName = command.Request.FileName,
            Id = command.Request.Id
        });

        if (rowsAffected == 0)
        {
            throw new KeyNotFoundException(
                $"No record found with Id={command.Request.Id} in database '{command.Request.DatabaseName}'."
            );
        }

        return rowsAffected;
    }
}
