namespace PocketSqlApi.Models;

public class ExecuteQueryRequest
{
    public string DatabaseName { get; set; } = string.Empty;
    public string SqlQuery { get; set; } = string.Empty;
}
