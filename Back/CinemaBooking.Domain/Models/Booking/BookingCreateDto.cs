namespace CinemaBooking.Domain.Models.Booking;

public class BookingCreateDto
{
    public int MovieId { get; set; }
    public string MovieTitle { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string Hall { get; set; } = string.Empty;
    public string[] Seats { get; set; } = Array.Empty<string>();
    public string Status { get; set; } = "booked";
    public string Showtime { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public int? ScreeningId { get; set; }
}
