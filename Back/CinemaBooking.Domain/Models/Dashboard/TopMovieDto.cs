namespace CinemaBooking.Domain.Models.Dashboard;

public class TopMovieDto
{
    public int MovieId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int BookingCount { get; set; }
    public int SeatsBooked { get; set; }
    public decimal Revenue { get; set; }
}
