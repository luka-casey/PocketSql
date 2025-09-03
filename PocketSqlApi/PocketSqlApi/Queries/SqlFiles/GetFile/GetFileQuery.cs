using PocketSqlApi.Models;

namespace PocketSqlApi.Queries.SqlFiles.GetFile;

public class GetFileQuery
{
    public GetFileRequest Request { get; set; }
    
    public GetFileQuery(GetFileRequest request)
    {
        Request = request;
    }
}