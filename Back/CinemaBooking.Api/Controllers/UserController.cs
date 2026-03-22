using CinemaBooking.BusinessLayer;
using CinemaBooking.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "admin")]
public class UserController : ControllerBase
{
    private readonly IUserLogic _userLogic;

    public UserController()
    {
        var businessLogic = new BusinessLogic();
        _userLogic = businessLogic.GetUserLogic();
    }

    [HttpGet("list")]
    public IActionResult GetUserList()
    {
        var response = _userLogic.GetUserList();
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        var response = _userLogic.GetUserById(id);
        if (!response.IsSuccess)
            return NotFound(response);
        return Ok(response);
    }

    [HttpPut("{id}/status")]
    public IActionResult UpdateUserStatus(int id, [FromBody] string status)
    {
        var response = _userLogic.UpdateUserStatus(id, status);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteUser(int id)
    {
        var response = _userLogic.DeleteUser(id);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }
}
