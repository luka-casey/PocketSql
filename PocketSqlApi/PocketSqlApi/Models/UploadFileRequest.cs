namespace PocketSqlApi.Models;

public class UploadFileRequest
{
    public string Sql { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
}
