using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.BusinessLayer.Structure;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Core;

public class DashboardLogic : DashboardActions, IDashboardLogic
{
    public ServiceResponse GetUserStatistics() => GetUserStatisticsAction();
    public ServiceResponse GetBookingStatistics() => GetBookingStatisticsAction();
    public ServiceResponse GetRevenueAnalytics() => GetRevenueAnalyticsAction();
    public ServiceResponse GetTopMovies(int limit = 10) => GetTopMoviesAction(limit);
}
