using PocketSqlApi.Models;

namespace PocketSqlApi.Commands.SqlFiles.UploadFile;

public class UploadFileCommand
{
    public string Sql { get; set; }
    public string DatabaseName { get; set; }
    public string FileName { get; set; }

    public UploadFileCommand(string sql, string databaseName, string fileName)
    {
        Sql = sql;
        DatabaseName = databaseName;
        FileName = fileName;
    }
}