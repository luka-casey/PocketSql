using Microsoft.AspNetCore.Mvc;
using PocketSqlApi.Commands.SqlFiles.EditFile;
using PocketSqlApi.Commands.SqlFiles.UploadFile;
using PocketSqlApi.Models;
using PocketSqlApi.Queries.SqlFiles.GetAllFiles;
using PocketSqlApi.Queries.SqlFiles.GetFile;

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
    public async Task<IActionResult> UploadFile(string Sql, string DatabaseName, string FileName)
    {
        await new UploadFileCommandHandler(_config.GetConnectionString("Default")).
            Handle(new UploadFileCommand(Sql, DatabaseName, FileName));
        return Ok();
    }

    [HttpGet("getFile")]
    public async Task<SqlFileValueData> GetFile(string database, int ID)
    {
        SqlFileValueData result = await new GetFileQueryHandler(_config.GetConnectionString("Default")).
            Handle(new GetFileQuery(database, ID));
        return result;
    }

    [HttpPatch("editFile")]
    public async Task<IActionResult> EditFile(string database, int id, string sql, string fileName)
    {
        var result = await new EditFileCommandHandler(_config.GetConnectionString("Default")).
            Handle(new EditFileCommand(database, id, sql, fileName));
        return Ok();
    }

    [HttpGet("getAllFiles")]
    public async Task<IActionResult> GetAllFiles()
    {
        var handler = new GetAllFilesQueryHandler(_config.GetConnectionString("Default"));
        var result = await handler.Handle();

        // Return 200 OK with the data
        return Ok(result);
    }

}
