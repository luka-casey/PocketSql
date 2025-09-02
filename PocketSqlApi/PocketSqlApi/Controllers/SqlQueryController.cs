using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Mvc;
using PocketSqlApi.Commands.SqlFiles.UploadFile;
using PocketSqlApi.Models;
using PocketSqlApi.Queries.SqlQuery.Execute;
using PocketSqlApi.Queries.SqlQuery.GetDatabases;
using PocketSqlApi.Queries.SqlQuery.GetSchema;

namespace PocketSqlApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SqlQueryController : ControllerBase
{
    private readonly IConfiguration _config;
    public SqlQueryController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("executeQuery")]
    public async Task<IActionResult> ExecuteQuery([FromBody] ExecuteQueryRequest request)
    {
        var result = await new ExecuteQueryHandler(_config.GetConnectionString("Default"))
            .Handle(new ExecuteQuery(request));

        return result.Success ? Ok(result.Data) : BadRequest(new { result.Error, result.ErrorCode });
    }


    [HttpGet("GetSchema")]
    public async Task<IActionResult> GetSchema(string database)
    {
        var result = await new GetSchemaQueryHandler(_config.GetConnectionString("Default"))
            .Handle(new GetSchemaQuery(database));
        return result.Success ? Ok(result.Data) : BadRequest(new { result.Error, result.ErrorCode });
    }

    [HttpGet("GetDatabases")]
    public async Task<IActionResult> GetDatabases()
    {
        var result = await new GetDatabasesQueryHandler(_config.GetConnectionString("Default"))
            .Handle();
        return result.Success ? Ok(result.Data) : BadRequest(new { result.Error, result.ErrorCode });
    }

}