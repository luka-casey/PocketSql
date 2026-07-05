using Microsoft.AspNetCore.Mvc;
using PocketSqlApi.Commands.SqlFiles.DeleteFile;
using PocketSqlApi.Commands.SqlFiles.EditFile;
using PocketSqlApi.Commands.SqlFiles.UploadFile;
using PocketSqlApi.Models;
using PocketSqlApi.Queries.SqlFiles.GetAllFiles;
using PocketSqlApi.Queries.SqlFiles.GetFile;
using PocketSqlApi.Queries.SqlFiles.GetFileByName;

namespace PocketSqlApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SqlFileController : ControllerBase
{
    private readonly IConfiguration _config;
    public SqlFileController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("uploadFile")]
    public async Task<IActionResult> UploadFile(UploadFileRequest uploadFileRequest)
    {
        await new UploadFileCommandHandler(_config.GetConnectionString("Default")).
            Handle(new UploadFileCommand(uploadFileRequest));
        return Ok();
    }

    [HttpGet("getFile")]
    public async Task<SqlFileValueData> GetFile([FromQuery] GetFileRequest getFileRequest)
    {
        SqlFileValueData result = await new GetFileQueryHandler(_config.GetConnectionString("Default"))
            .Handle(new GetFileQuery(getFileRequest));
        return result;
    }

    [HttpGet("getFileByName")]
    public async Task<SqlFileValueData> GetFileByName([FromQuery] GetFileByNameRequest request)
    {
        SqlFileValueData result = await new GetFileByNameQueryHandler(_config.GetConnectionString("Default"))
            .Handle(new GetFileByNameQuery(request));
        return result;
    }


    [HttpPatch("editFile")]
    public async Task<IActionResult> EditFile([FromBody] EditFileRequest editFileRequest)
    {
        var result = await new EditFileCommandHandler(_config.GetConnectionString("Default"))
            .Handle(new EditFileCommand(editFileRequest));

        return Ok(result);
    }


    [HttpGet("getAllFiles")]
    public async Task<IActionResult> GetAllFiles()
    {
        var handler = new GetAllFilesQueryHandler(_config.GetConnectionString("Default"));
        var result = await handler.Handle();

        // Return 200 OK with the data
        return Ok(result);
    }

    [HttpPost("deleteFile")]
    public async Task<IActionResult> DeleteFile(DeleteFileRequest deleteFileRequest)
    {
        await new DeleteFileCommandHandler(_config.GetConnectionString("Default")).
            Handle(new DeleteFileCommand(deleteFileRequest));
        return Ok();
    }

    //TODO: implement download file endpoint 

}
