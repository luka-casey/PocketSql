namespace PocketSqlApi.Models;

public class DeleteFileRequest
{
    public string FileName { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
}
