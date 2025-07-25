namespace PocketSqlApi.Models;

public class SqlQueryResult
{
    public bool Success { get; set; }
    public object? Data { get; set; }
    public string? Error { get; set; }
    public int? ErrorCode { get; set; }

    public static SqlQueryResult Ok(object data) => new() { Success = true, Data = data };

    public static SqlQueryResult Fail(string error, int? code = null) =>
        new() { Success = false, Error = error, ErrorCode = code };
}
