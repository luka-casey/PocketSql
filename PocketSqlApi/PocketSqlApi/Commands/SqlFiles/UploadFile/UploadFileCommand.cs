using PocketSqlApi.Models;

namespace PocketSqlApi.Commands.SqlFiles.UploadFile;

public class UploadFileCommand
{
    public SqlQueryRequest Request { get; }
    
    public UploadFileCommand(SqlQueryRequest request)
    {
        Request = request;
    }
}