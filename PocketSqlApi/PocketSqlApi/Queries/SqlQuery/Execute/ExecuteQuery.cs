using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlQuery.Execute;

public class ExecuteQuery
{
    public string DatabaseName { get; set; }   
    public string SqlQuery { get; set; }
    public ExecuteQuery(string databaseName, string sqlQuery)
    {
        DatabaseName = databaseName;
        SqlQuery = sqlQuery;
    }
}