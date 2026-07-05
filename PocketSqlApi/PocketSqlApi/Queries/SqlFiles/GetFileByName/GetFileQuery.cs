using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlFiles.GetFileByName;

public class GetFileByNameQuery
{
    public GetFileByNameRequest Request { get; set; }
    
    public GetFileByNameQuery(GetFileByNameRequest request)
    {
        Request = request;
    }
}