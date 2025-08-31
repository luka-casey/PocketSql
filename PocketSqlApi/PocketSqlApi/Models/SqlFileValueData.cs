namespace PocketSqlApi.Models;

public class SqlFileValueData
{
    public int Id { get; set; }
    public string SqlText { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
    public DateTime CreatedDateTime { get; set; }
    public DateTime ModifiedDateTime { get; set; }
}