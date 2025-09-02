using PocketSqlApi.Models;

namespace PocketSqlApi.Commands.SqlFiles.UploadFile;

public class UploadFileCommand
{
    public UploadFileRequest Request { get; set; }

    public UploadFileCommand(UploadFileRequest request)
    {
        Request = request;
    }
}