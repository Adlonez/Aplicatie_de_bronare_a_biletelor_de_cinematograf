using CinemaBooking.BusinessLayer;
using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.Domain.Models.Hall;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/halls")]
public class HallController : ControllerBase
{
    private readonly IHallLogic _hallLogic;

    public HallController()
    {
        var businessLogic = new BusinessLogic();
        _hallLogic = businessLogic.GetHallLogic();
    }

    [HttpGet("list")]
    public IActionResult GetHallList()
    {
        var response = _hallLogic.GetHallList();
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public IActionResult GetHall(int id)
    {
        var response = _hallLogic.GetHallById(id);
        if (!response.IsSuccess)
            return NotFound(response);
        return Ok(response);
    }

    [HttpPost("create")]
    [Authorize(Roles = "admin")]
    public IActionResult CreateHall([FromBody] HallCreateDto dto)
    {
        var response = _hallLogic.CreateHall(dto);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult UpdateHall(int id, [FromBody] HallCreateDto dto)
    {
        var response = _hallLogic.UpdateHall(id, dto);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult DeleteHall(int id)
    {
        var response = _hallLogic.DeleteHall(id);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }
}
