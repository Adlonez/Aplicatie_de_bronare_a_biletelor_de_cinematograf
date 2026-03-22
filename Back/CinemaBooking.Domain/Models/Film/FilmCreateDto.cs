namespace CinemaBooking.Domain.Models.Film;

public class FilmCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string Poster { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Href { get; set; } = string.Empty;
    public string Format { get; set; } = "2D";
    public string[] Languages { get; set; } = Array.Empty<string>();
    public string Status { get; set; } = "progress";
    public bool Toptier { get; set; }
    public int? Duration { get; set; }
    public string? Genre { get; set; }
    public string? ReleaseDate { get; set; }
    public string? ScreeningPeriodStart { get; set; }
    public string? ScreeningPeriodEnd { get; set; }
}
