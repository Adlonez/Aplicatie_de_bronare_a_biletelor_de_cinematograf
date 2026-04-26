namespace CinemaBooking.Domain.Models.Dashboard;

public class RevenueAnalyticsDto
{
    public decimal TotalRevenue { get; set; }
    public decimal RevenueThisWeek { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public decimal AverageBookingValue { get; set; }
}
