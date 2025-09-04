namespace PocketSqlApi.Models;

public class EditFileRequest
{
    public string DatabaseName { get; set; } = string.Empty;
    public int Id { get; set; }
    public string Sql { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}