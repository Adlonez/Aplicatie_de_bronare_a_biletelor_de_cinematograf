namespace CinemaBooking.Domain.Entities.News;

public class NewsEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string FullContent { get; set; } = string.Empty;
}
