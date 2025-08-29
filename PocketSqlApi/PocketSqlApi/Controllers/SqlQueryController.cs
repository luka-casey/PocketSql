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

    [HttpPost("execute")]
    public async Task<IActionResult> ExecuteQuery([FromBody] SqlQueryRequest request)
    {
        var result = await new ExecuteQueryHandler(_config.GetConnectionString("Default"))
            .Handle(new ExecuteQuery(request));

        return result.Success ? Ok(result.Data) : BadRequest(new { result.Error, result.ErrorCode });
    }

    [HttpGet("schema")]
    public async Task<IActionResult> GetSchema(string database)
    {
        var result = await new GetSchemaQueryHandler(_config.GetConnectionString("Default"))
            .Handle(new GetSchemaQuery(database));
        return result.Success ? Ok(result.Data) : BadRequest(new { result.Error, result.ErrorCode });
    }

    [HttpGet("databases")]
    public async Task<IActionResult> GetDatabases()
    {
        var result = await new GetDatabasesQueryHandler(_config.GetConnectionString("Default"))
            .Handle();
        return result.Success ? Ok(result.Data) : BadRequest(new { result.Error, result.ErrorCode });
    }
    
    //TODO Create a endpoint that loads a file from a db
    
    //TODO Create a endpoint that lets you edit an existing file by ID
    
    //TODO Create a endpoint that gets all file ID's with their file names 
    
}