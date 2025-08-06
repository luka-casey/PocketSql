namespace PocketSqlApi.Models;

public class SqlQueryRequest
{
    public string Sql { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
}