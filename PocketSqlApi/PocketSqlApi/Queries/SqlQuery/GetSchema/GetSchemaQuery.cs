namespace PocketSqlApi.Queries.SqlQuery.GetSchema;

public class GetSchemaQuery
{
    public string Database { get; }
    
    public GetSchemaQuery(string database)
    {
        Database = database;   
    }
}