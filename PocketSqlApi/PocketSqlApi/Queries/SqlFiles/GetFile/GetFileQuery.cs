using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlFiles.GetFile;

public class GetFileQuery
{
    public string Database { get; set; } = string.Empty;
    public int Id { get; set; }
    
    public GetFileQuery(string database, int ID)
    {
        Database = database;
        Id = ID;
    }
}