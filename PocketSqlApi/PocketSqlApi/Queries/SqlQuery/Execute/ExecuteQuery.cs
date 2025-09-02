using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlQuery.Execute;

public class ExecuteQuery
{
    public ExecuteQueryRequest Request { get; set; }
    public ExecuteQuery(ExecuteQueryRequest request)
    {
        Request = request;
    }
}