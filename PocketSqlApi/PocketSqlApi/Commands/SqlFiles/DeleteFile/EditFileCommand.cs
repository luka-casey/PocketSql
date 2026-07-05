using PocketSqlApi.Models;

namespace PocketSqlApi.Commands.SqlFiles.DeleteFile;

public class DeleteFileCommand
{
    public DeleteFileRequest Request;

    public DeleteFileCommand(DeleteFileRequest request)
    {
        Request = request;
    }
}