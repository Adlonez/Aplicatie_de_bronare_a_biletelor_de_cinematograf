using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Interfaces;

public interface IDashboardLogic
{
    ServiceResponse GetUserStatistics();
    ServiceResponse GetBookingStatistics();
    ServiceResponse GetRevenueAnalytics();
    ServiceResponse GetTopMovies(int limit = 10);
}
