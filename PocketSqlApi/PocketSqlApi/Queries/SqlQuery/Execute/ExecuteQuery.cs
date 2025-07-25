using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlQuery.Execute;

public class ExecuteQuery
{
    public SqlQueryRequest Request { get; }

    public ExecuteQuery(SqlQueryRequest request)
    {
        Request = request;
    }
}