using System.Text.Json;
using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Entities.Booking;
using CinemaBooking.Domain.Models.Dashboard;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Structure;

public class DashboardActions
{
    protected readonly CinemaDbContext _context = new();

    protected ServiceResponse GetUserStatisticsAction()
    {
        try
        {
            var now = DateTime.UtcNow;
            var startOfWeek = GetStartOfWeek(now);
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var users = _context.Users
                .Where(u => !u.Deleted)
                .ToList();

            var dto = new UserStatisticsDto
            {
                TotalUsers = users.Count,
                ActiveUsers = users.Count(u => IsEqualIgnoreCase(u.Status, "active")),
                InactiveUsers = users.Count(u => IsEqualIgnoreCase(u.Status, "inactive")),
                AdminUsers = users.Count(u => IsEqualIgnoreCase(u.Role, "admin")),
                NewUsersThisWeek = users.Count(u => u.RegistrationDate >= startOfWeek),
                NewUsersThisMonth = users.Count(u => u.RegistrationDate >= startOfMonth)
            };

            return new ServiceResponse { IsSuccess = true, Data = dto };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetBookingStatisticsAction()
    {
        try
        {
            var now = DateTime.UtcNow;
            var startOfWeek = GetStartOfWeek(now);
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var bookings = GetActiveBookings();

            var dto = new BookingStatisticsDto
            {
                TotalBookings = bookings.Count,
                BookingsThisWeek = bookings.Count(b => b.BookingDate >= startOfWeek),
                BookingsThisMonth = bookings.Count(b => b.BookingDate >= startOfMonth),
                BookedBookings = bookings.Count(b => IsEqualIgnoreCase(b.Status, "booked")),
                BoughtBookings = bookings.Count(b => IsEqualIgnoreCase(b.Status, "bought")),
                TotalSeatsBooked = bookings.Sum(GetSeatCount)
            };

            return new ServiceResponse { IsSuccess = true, Data = dto };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetRevenueAnalyticsAction()
    {
        try
        {
            var now = DateTime.UtcNow;
            var startOfWeek = GetStartOfWeek(now);
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var bookings = GetActiveBookings();
            var totalRevenue = bookings.Sum(b => b.TotalPrice);

            var dto = new RevenueAnalyticsDto
            {
                TotalRevenue = TruncateToTwoDecimals(totalRevenue),
                RevenueThisWeek = TruncateToTwoDecimals(bookings.Where(b => b.BookingDate >= startOfWeek).Sum(b => b.TotalPrice)),
                RevenueThisMonth = TruncateToTwoDecimals(bookings.Where(b => b.BookingDate >= startOfMonth).Sum(b => b.TotalPrice)),
                AverageBookingValue = bookings.Count == 0 ? 0 : TruncateToTwoDecimals(totalRevenue / bookings.Count)
            };

            return new ServiceResponse { IsSuccess = true, Data = dto };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetTopMoviesAction(int limit)
    {
        try
        {
            var take = limit <= 0 ? 10 : limit;
            var filmTitles = _context.Films
                .Where(f => !f.Deleted)
                .ToDictionary(f => f.Id, f => f.Title);

            var topMovies = GetActiveBookings()
                .GroupBy(b => b.MovieId)
                .Select(group =>
                {
                    var firstBooking = group.First();
                    return new TopMovieDto
                    {
                        MovieId = group.Key,
                        Title = filmTitles.TryGetValue(group.Key, out var title)
                            ? title
                            : firstBooking.MovieTitle,
                        BookingCount = group.Count(),
                        SeatsBooked = group.Sum(GetSeatCount),
                        Revenue = TruncateToTwoDecimals(group.Sum(b => b.TotalPrice))
                    };
                })
                .OrderByDescending(movie => movie.BookingCount)
                .ThenByDescending(movie => movie.Revenue)
                .Take(take)
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = topMovies };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    private List<BookingEntity> GetActiveBookings()
    {
        return _context.Bookings
            .Where(b => !b.Deleted)
            .ToList();
    }

    private static DateTime GetStartOfWeek(DateTime value)
    {
        var date = value.Date;
        var daysSinceMonday = ((int)date.DayOfWeek + 6) % 7;
        return date.AddDays(-daysSinceMonday);
    }

    private static int GetSeatCount(BookingEntity booking)
    {
        if (string.IsNullOrWhiteSpace(booking.Seats))
            return 0;

        try
        {
            return JsonSerializer.Deserialize<string[]>(booking.Seats)?.Length ?? 0;
        }
        catch (JsonException)
        {
            return 0;
        }
    }

    private static bool IsEqualIgnoreCase(string value, string expected)
    {
        return string.Equals(value, expected, StringComparison.OrdinalIgnoreCase);
    }

    private static decimal TruncateToTwoDecimals(decimal value)
    {
        return Math.Truncate(value * 100) / 100;
    }
}
