namespace PocketSqlApi.Models;

public class GetFileRequest
{
    public string DatabaseName { get; set; } = string.Empty;
    public int Id { get; set; }
}
