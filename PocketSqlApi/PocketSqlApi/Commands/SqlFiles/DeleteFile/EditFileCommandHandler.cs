using Dapper;
using MySqlConnector;
using PocketSqlApi.Models;

namespace PocketSqlApi.Commands.SqlFiles.DeleteFile;

public class DeleteFileCommandHandler
{
    private readonly string _connectionString;

    public DeleteFileCommandHandler(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<int> Handle(DeleteFileCommand command)
    {
        if (command?.Request == null)
            throw new ArgumentNullException(nameof(command), "EditFileCommand cannot be null.");

        if (string.IsNullOrWhiteSpace(command.Request.DatabaseName))
            throw new ArgumentException("DatabaseName is required.", nameof(command.Request.DatabaseName));

        var builder = new MySqlConnectionStringBuilder(_connectionString)
        {
            Database = command.Request.DatabaseName
        };

        await using var conn = new MySqlConnection(builder.ConnectionString);
        await conn.OpenAsync();

        // var updateCommand = @"
        //     UPDATE SqlFiles 
        //     SET SqlText = @SqlText,
        //         ModifiedDateTime = @ModifiedDateTime,
        //         FileName = @FileName
        //     WHERE Id = @Id;
        // ";

        var deleteCommand = @"
            DELETE FROM SqlFiles WHERE FileName = @FileName;
        ";

        var rowsAffected = await conn.ExecuteAsync(deleteCommand, new
        {
            FileName = command.Request.FileName,
        });

        if (rowsAffected == 0)
        {
            throw new KeyNotFoundException(
                $"No record found with FileName={command.Request.FileName} in database '{command.Request.DatabaseName}'."
            );
        }

        return rowsAffected;
    }
}
