namespace CinemaBooking.Domain.Entities.Screening;

public class ScreeningEntity
{
    public int Id { get; set; }
    public int MovieId { get; set; }
    public string MovieTitle { get; set; } = string.Empty;
    public string Hall { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Time { get; set; } = string.Empty;
    public bool Deleted { get; set; }

    // Navigation
    public Film.FilmEntity? Film { get; set; }
    public ICollection<Booking.BookingEntity> Bookings { get; set; } = new List<Booking.BookingEntity>();
}
