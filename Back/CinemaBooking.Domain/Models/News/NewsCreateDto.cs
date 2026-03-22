namespace CinemaBooking.Domain.Models.News;

public class NewsCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string FullContent { get; set; } = string.Empty;
}
