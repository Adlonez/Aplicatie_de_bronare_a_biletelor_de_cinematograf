using CinemaBooking.BusinessLayer;
using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.Domain.Models.Auth;
using CinemaBooking.Domain.Models.User;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthLogic _authLogic;

    public AuthController()
    {
        var businessLogic = new BusinessLogic();
        _authLogic = businessLogic.GetAuthLogic();
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] UserCreateDto dto)
    {
        var response = _authLogic.Register(dto);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        var response = _authLogic.Login(dto);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }
}
