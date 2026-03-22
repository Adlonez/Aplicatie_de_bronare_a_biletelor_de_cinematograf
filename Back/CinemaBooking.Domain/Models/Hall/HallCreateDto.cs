namespace CinemaBooking.Domain.Models.Hall;

public class HallCreateDto
{
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string[] Features { get; set; } = Array.Empty<string>();
    public SeatMapDto SeatMap { get; set; } = new();
}

public class SeatMapDto
{
    public SeatRowDto[] Rows { get; set; } = Array.Empty<SeatRowDto>();
}

public class SeatRowDto
{
    public string Row { get; set; } = string.Empty;
    public int[] Seats { get; set; } = Array.Empty<int>();
}
