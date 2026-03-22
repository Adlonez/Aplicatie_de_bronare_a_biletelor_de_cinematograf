namespace CinemaBooking.Domain.Entities.Hall;

public class HallEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string Features { get; set; } = string.Empty; // JSON array stored as string
    public string SeatMap { get; set; } = string.Empty; // JSON object stored as string
}
