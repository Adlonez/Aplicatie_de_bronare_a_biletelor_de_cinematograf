using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok("CinemaBooking API is running");
    }
}
