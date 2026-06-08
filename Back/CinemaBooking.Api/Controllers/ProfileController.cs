using CinemaBooking.BusinessLayer;
using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.Domain.Models.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IUserLogic _userLogic;

    public ProfileController()
    {
        var businessLogic = new BusinessLogic();
        _userLogic = businessLogic.GetUserLogic();
    }

    [HttpGet("me")]
    public IActionResult GetProfile()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
            return Unauthorized();
        var response = _userLogic.GetUserProfile(userId);
        return response.IsSuccess ? Ok(response) : NotFound(response);
    }

    [HttpPut("me")]
    public IActionResult UpdateProfile([FromBody] UserProfileUpdateDto dto)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
            return Unauthorized();
        var response = _userLogic.UpdateUserProfile(userId, dto);
        return response.IsSuccess ? Ok(response) : BadRequest(response);
    }
}
