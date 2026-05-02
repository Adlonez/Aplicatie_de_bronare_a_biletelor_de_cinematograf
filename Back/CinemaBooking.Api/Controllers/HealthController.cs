using CinemaBooking.DataAccessLayer.Context;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new { status = "UP", message = "CinemaBooking API is running" });
    }

    [HttpGet("db")]
    public IActionResult CheckDb()
    {
        try
        {
            using var context = new CinemaDbContext();
            var canConnect = context.Database.CanConnect();
            return Ok(new { status = canConnect ? "UP" : "DOWN", database = "MySQL" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { status = "ERROR", message = ex.Message });
        }
    }
}
