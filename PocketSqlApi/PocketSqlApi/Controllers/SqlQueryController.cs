using Microsoft.AspNetCore.Mvc;
using PocketSqlApi.Models;
using PocketSqlApi.Queries.SqlQuery.Execute;
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

    [HttpPost]
    public async Task<IActionResult> ExecuteQuery([FromBody] SqlQueryRequest request)
    {
        var result = await new ExecuteQueryHandler(_config.GetConnectionString("Default"))
            .Handle(new ExecuteQuery(request));

        return result.Success ? Ok(result.Data) : BadRequest(new { result.Error, result.ErrorCode });
    }

    [HttpGet("schema")]
    public async Task<IActionResult> GetSchema()
    {
        var result = await new GetSchemaQueryHandler(_config.GetConnectionString("Default"))
            .Handle(new GetSchemaQuery());
        return result.Success ? Ok(result.Data) : BadRequest(new { result.Error, result.ErrorCode });
    }
    
}