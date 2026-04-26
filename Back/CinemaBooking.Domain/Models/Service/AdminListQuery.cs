namespace CinemaBooking.Domain.Models.Service;

public class AdminListQuery
{
    private const int MaxPageSize = 100;
    private int _pageNumber = 1;
    private int _pageSize = 20;

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 20,
            > MaxPageSize => MaxPageSize,
            _ => value
        };
    }

    public string? Search { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
    public string? Status { get; set; }
    public string? Role { get; set; }
    public string? Genre { get; set; }
    public string? Format { get; set; }
    public string? Hall { get; set; }
    public string[]? Halls { get; set; }
    public string? TimeFrom { get; set; }
    public string? TimeTo { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? MinDuration { get; set; }
    public int? MaxDuration { get; set; }

    public int Skip => (PageNumber - 1) * PageSize;
    public bool SortDescending => string.Equals(SortDirection, "desc", StringComparison.OrdinalIgnoreCase);
}
