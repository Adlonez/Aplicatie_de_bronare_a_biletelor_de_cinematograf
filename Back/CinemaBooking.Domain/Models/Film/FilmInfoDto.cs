namespace CinemaBooking.Domain.Models.Film;

public class FilmInfoDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Poster { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Href { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public string[] Languages { get; set; } = Array.Empty<string>();
    public string Status { get; set; } = string.Empty;
    public bool Toptier { get; set; }
    public int? Duration { get; set; }
    public string? Genre { get; set; }
    public string? ReleaseDate { get; set; }
    public ScreeningPeriodDto? ScreeningPeriod { get; set; }
    public bool? Deleted { get; set; }
}

public class ScreeningPeriodDto
{
    public string Start { get; set; } = string.Empty;
    public string End { get; set; } = string.Empty;
}
