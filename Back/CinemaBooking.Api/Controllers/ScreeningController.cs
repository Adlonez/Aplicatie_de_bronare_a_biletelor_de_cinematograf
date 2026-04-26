using CinemaBooking.BusinessLayer;
using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.Domain.Models.Screening;
using CinemaBooking.Domain.Models.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/screenings")]
public class ScreeningController : ControllerBase
{
    private readonly IScreeningLogic _screeningLogic;

    public ScreeningController()
    {
        var businessLogic = new BusinessLogic();
        _screeningLogic = businessLogic.GetScreeningLogic();
    }

    [HttpGet("list")]
    public IActionResult GetScreeningList([FromQuery] AdminListQuery query)
    {
        var response = Request.Query.Count == 0
            ? _screeningLogic.GetScreeningList()
            : _screeningLogic.GetScreeningList(query);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public IActionResult GetScreening(int id)
    {
        var response = _screeningLogic.GetScreeningById(id);
        if (!response.IsSuccess)
            return NotFound(response);
        return Ok(response);
    }

    [HttpGet("movie/{movieId}")]
    public IActionResult GetScreeningsByMovie(int movieId)
    {
        var response = _screeningLogic.GetScreeningsByMovieId(movieId);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPost("create")]
    [Authorize(Roles = "admin")]
    public IActionResult CreateScreening([FromBody] ScreeningCreateDto dto)
    {
        var response = _screeningLogic.CreateScreening(dto);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult UpdateScreening(int id, [FromBody] ScreeningCreateDto dto)
    {
        var response = _screeningLogic.UpdateScreening(id, dto);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult DeleteScreening(int id)
    {
        var response = _screeningLogic.DeleteScreening(id);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }
}
