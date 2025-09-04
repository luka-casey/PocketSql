using PocketSqlApi.Models;

namespace PocketSqlApi.Commands.SqlFiles.EditFile;

public class EditFileCommand
{
    public EditFileRequest Request;

    public EditFileCommand(EditFileRequest request)
    {
        Request = request;
    }
}