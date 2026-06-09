using System.Security.Claims;
using CinemaBooking.BusinessLayer;
using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.Domain.Models.Booking;
using CinemaBooking.Domain.Models.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBooking.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingController : ControllerBase
{
    private readonly IBookingLogic _bookingLogic;

    public BookingController()
    {
        var businessLogic = new BusinessLogic();
        _bookingLogic = businessLogic.GetBookingLogic();
    }

    [HttpGet("list")]
    [Authorize(Roles = "admin")]
    public IActionResult GetBookingList([FromQuery] AdminListQuery query)
    {
        var response = Request.Query.Count == 0
            ? _bookingLogic.GetBookingList()
            : _bookingLogic.GetBookingList(query);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpGet("{id}")]
    [Authorize]
    public IActionResult GetBooking(int id)
    {
        var response = _bookingLogic.GetBookingById(id);
        if (!response.IsSuccess)
            return NotFound(response);
        return Ok(response);
    }

    [HttpGet("user/{userId}")]
    [Authorize]
    public IActionResult GetBookingsByUser(int userId)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int currentUserId))
            return Unauthorized();
        if (currentUserId != userId && !User.IsInRole("admin"))
            return Forbid();

        var response = _bookingLogic.GetBookingsByUserId(userId);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPost("create")]
    public IActionResult CreateBooking([FromBody] BookingCreateDto dto)
    {
        int? userId = null;
        if (int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int parsedUserId))
            userId = parsedUserId;

        var response = _bookingLogic.CreateBooking(dto, userId);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "admin")]
    public IActionResult UpdateBookingStatus(int id, [FromBody] string status)
    {
        var response = _bookingLogic.UpdateBookingStatus(id, status);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult UpdateBooking(int id, [FromBody] BookingCreateDto bookingDto){
        var res = _bookingLogic.UpdateBooking(id, bookingDto);
        return res.IsSuccess ? Ok(res) : BadRequest(res);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult DeleteBooking(int id)
    {
        var response = _bookingLogic.DeleteBooking(id);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPost("{id}/cancel")]
    [Authorize]
    public IActionResult CancelOwnBooking(int id)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int currentUserId))
            return Unauthorized();
        var response = _bookingLogic.CancelOwnBooking(id, currentUserId);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }
}
