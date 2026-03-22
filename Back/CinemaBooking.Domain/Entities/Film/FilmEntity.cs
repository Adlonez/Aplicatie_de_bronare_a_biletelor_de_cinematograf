namespace CinemaBooking.Domain.Entities.Film;

public class FilmEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Poster { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Href { get; set; } = string.Empty;
    public string Format { get; set; } = "2D"; // "2D" or "3D"
    public string Languages { get; set; } = string.Empty; // JSON array stored as string
    public string Status { get; set; } = "progress"; // "progress" or "soon"
    public bool Toptier { get; set; }
    public int? Duration { get; set; }
    public string? Genre { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public DateTime? ScreeningPeriodStart { get; set; }
    public DateTime? ScreeningPeriodEnd { get; set; }
    public bool Deleted { get; set; }

    // Navigation
    public ICollection<Screening.ScreeningEntity> Screenings { get; set; } = new List<Screening.ScreeningEntity>();
}
