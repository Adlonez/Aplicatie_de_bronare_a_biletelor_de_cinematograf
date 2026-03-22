using CinemaBooking.BusinessLayer;
using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.Domain.Models.News;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/news")]
public class NewsController : ControllerBase
{
    private readonly INewsLogic _newsLogic;

    public NewsController()
    {
        var businessLogic = new BusinessLogic();
        _newsLogic = businessLogic.GetNewsLogic();
    }

    [HttpGet("list")]
    public IActionResult GetNewsList()
    {
        var response = _newsLogic.GetNewsList();
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public IActionResult GetNews(int id)
    {
        var response = _newsLogic.GetNewsById(id);
        if (!response.IsSuccess)
            return NotFound(response);
        return Ok(response);
    }

    [HttpPost("create")]
    [Authorize(Roles = "admin")]
    public IActionResult CreateNews([FromBody] NewsCreateDto dto)
    {
        var response = _newsLogic.CreateNews(dto);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult UpdateNews(int id, [FromBody] NewsCreateDto dto)
    {
        var response = _newsLogic.UpdateNews(id, dto);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult DeleteNews(int id)
    {
        var response = _newsLogic.DeleteNews(id);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }
}
