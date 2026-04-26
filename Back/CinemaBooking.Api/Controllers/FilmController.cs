using CinemaBooking.BusinessLayer;
using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.Domain.Models.Film;
using CinemaBooking.Domain.Models.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/films")]
public class FilmController : ControllerBase
{
    private readonly IFilmLogic _filmLogic;

    public FilmController()
    {
        var businessLogic = new BusinessLogic();
        _filmLogic = businessLogic.GetFilmLogic();
    }

    [HttpGet("list")]
    public IActionResult GetFilmList([FromQuery] AdminListQuery query)
    {
        var response = Request.Query.Count == 0
            ? _filmLogic.GetFilmList()
            : _filmLogic.GetFilmList(query);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public IActionResult GetFilm(int id)
    {
        var response = _filmLogic.GetFilmById(id);
        if (!response.IsSuccess)
            return NotFound(response);
        return Ok(response);
    }

    [HttpPost("create")]
    [Authorize(Roles = "admin")]
    public IActionResult CreateFilm([FromBody] FilmCreateDto dto)
    {
        var response = _filmLogic.CreateFilm(dto);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult UpdateFilm(int id, [FromBody] FilmCreateDto dto)
    {
        var response = _filmLogic.UpdateFilm(id, dto);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult DeleteFilm(int id)
    {
        var response = _filmLogic.DeleteFilm(id);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }
}
