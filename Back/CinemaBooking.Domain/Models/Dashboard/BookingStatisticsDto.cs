namespace CinemaBooking.Domain.Models.Dashboard;

public class BookingStatisticsDto
{
    public int TotalBookings { get; set; }
    public int BookingsThisWeek { get; set; }
    public int BookingsThisMonth { get; set; }
    public int BookedBookings { get; set; }
    public int BoughtBookings { get; set; }
    public int TotalSeatsBooked { get; set; }
}
