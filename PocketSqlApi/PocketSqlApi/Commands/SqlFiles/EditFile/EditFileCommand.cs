using PocketSqlApi.Models;

namespace PocketSqlApi.Commands.SqlFiles.EditFile;

public class EditFileCommand
{
    public string Database { get; set; } = string.Empty;
    public int ID { get; set; }
    public string Sql { get; set; } = string.Empty;
    
    public EditFileCommand(string database, int id, string sql)
    {
        Database = database;
        ID = id;
        Sql = sql;
    }
}