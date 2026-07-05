namespace PocketSqlApi.Models;

public class GetFileByNameRequest
{
    public string DatabaseName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
