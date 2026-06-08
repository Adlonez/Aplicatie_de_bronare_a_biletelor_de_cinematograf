namespace CinemaBooking.Domain.Models.User;

using CinemaBooking.Domain.Models.Booking;

public class UserProfileDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string RegistrationDate { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool? Deleted { get; set; }
    public List<BookingInfoDto> Bookings { get; set; } = new List<BookingInfoDto>();
}
