namespace CinemaBooking.Domain.Models.User;

public class UserInfoDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string RegistrationDate { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool? Deleted { get; set; }
}
