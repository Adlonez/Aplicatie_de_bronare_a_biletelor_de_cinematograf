namespace CinemaBooking.Domain.Entities.User;

public class UserEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "user"; // "user" or "admin"
    public string Status { get; set; } = "active"; // "active" or "inactive"
    public DateTime RegistrationDate { get; set; }
    public bool Deleted { get; set; }

    // Navigation
    public ICollection<Booking.BookingEntity> Bookings { get; set; } = new List<Booking.BookingEntity>();
}
