namespace CinemaBooking.Domain.Entities.Booking;

public class BookingEntity
{
    public int Id { get; set; }
    public int MovieId { get; set; }
    public string MovieTitle { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string Hall { get; set; } = string.Empty;
    public string Seats { get; set; } = string.Empty; // JSON array stored as string
    public string Status { get; set; } = "booked"; // "bought" or "booked"
    public DateTime BookingDate { get; set; }
    public string Showtime { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public bool Deleted { get; set; }

    // Navigation
    public int? ScreeningId { get; set; }
    public Screening.ScreeningEntity? Screening { get; set; }
    public int? UserId { get; set; }
    public User.UserEntity? User { get; set; }
}
