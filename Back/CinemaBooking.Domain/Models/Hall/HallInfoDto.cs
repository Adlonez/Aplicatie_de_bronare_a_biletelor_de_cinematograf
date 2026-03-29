namespace CinemaBooking.Domain.Models.Hall;

public class HallInfoDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string[] Features { get; set; } = Array.Empty<string>();
    public SeatMapDto SeatMap { get; set; } = new();
}
