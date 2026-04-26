using CinemaBooking.BusinessLayer;
using CinemaBooking.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "admin")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardLogic _dashboardLogic;

    public DashboardController()
    {
        var businessLogic = new BusinessLogic();
        _dashboardLogic = businessLogic.GetDashboardLogic();
    }

    [HttpGet("user-statistics")]
    public IActionResult GetUserStatistics()
    {
        var response = _dashboardLogic.GetUserStatistics();
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("booking-statistics")]
    public IActionResult GetBookingStatistics()
    {
        var response = _dashboardLogic.GetBookingStatistics();
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("revenue-analytics")]
    public IActionResult GetRevenueAnalytics()
    {
        var response = _dashboardLogic.GetRevenueAnalytics();
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("top-movies")]
    public IActionResult GetTopMovies([FromQuery] int limit = 10)
    {
        var response = _dashboardLogic.GetTopMovies(limit);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }
}
