using CinemaBooking.BusinessLayer;
using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.Domain.Models.Booking;
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
    public IActionResult GetBookingList()
    {
        var response = _bookingLogic.GetBookingList();
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
        var response = _bookingLogic.GetBookingsByUserId(userId);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPost("create")]
    public IActionResult CreateBooking([FromBody] BookingCreateDto dto)
    {
        var response = _bookingLogic.CreateBooking(dto);
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

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult DeleteBooking(int id)
    {
        var response = _bookingLogic.DeleteBooking(id);
        if (!response.IsSuccess)
            return BadRequest(response);
        return Ok(response);
    }
}
