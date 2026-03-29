namespace CinemaBooking.Domain.Models.Screening;

public class ScreeningInfoDto
{
    public int Id { get; set; }
    public int MovieId { get; set; }
    public string MovieTitle { get; set; } = string.Empty;
    public string Hall { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public bool? Deleted { get; set; }
}
