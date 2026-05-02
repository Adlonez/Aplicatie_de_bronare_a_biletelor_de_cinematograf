using System.Text.Json;
using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Entities.Booking;
using CinemaBooking.Domain.Models.Booking;
using CinemaBooking.Domain.Models.Service;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.BusinessLayer.Structure;

public class BookingActions
{
    protected readonly CinemaDbContext _context = new();

    protected ServiceResponse CreateBookingAction(BookingCreateDto dto)
    {
        try
        {
            var entity = new BookingEntity
            {
                MovieId = dto.MovieId,
                MovieTitle = dto.MovieTitle,
                CustomerName = dto.CustomerName,
                CustomerEmail = dto.CustomerEmail,
                CustomerPhone = dto.CustomerPhone,
                Hall = dto.Hall,
                Seats = JsonSerializer.Serialize(dto.Seats),
                Status = dto.Status,
                BookingDate = DateTime.UtcNow,
                Showtime = dto.Showtime,
                TotalPrice = dto.TotalPrice,
                ScreeningId = dto.ScreeningId
            };

            _context.Bookings.Add(entity);
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Booking created successfully", Data = entity.Id };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BookingActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse GetBookingByIdAction(int id)
    {
        try
        {
            var entity = _context.Bookings.FirstOrDefault(b => b.Id == id && !b.Deleted);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Booking not found" };

            return new ServiceResponse { IsSuccess = true, Data = MapToDto(entity) };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BookingActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse GetBookingListAction()
    {
        try
        {
            var bookings = _context.Bookings
                .AsNoTracking()
                .Where(b => !b.Deleted)
                .Select(b => MapToDto(b))
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = bookings };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BookingActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse GetBookingListAction(AdminListQuery query)
    {
        try
        {
            var bookingsQuery = _context.Bookings
                .AsNoTracking()
                .Where(b => !b.Deleted);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();
                bookingsQuery = bookingsQuery.Where(b =>
                    b.MovieTitle.Contains(search) ||
                    b.CustomerName.Contains(search) ||
                    b.CustomerEmail.Contains(search) ||
                    b.CustomerPhone.Contains(search) ||
                    b.Hall.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.Status))
                bookingsQuery = bookingsQuery.Where(b => b.Status == query.Status);

            if (!string.IsNullOrWhiteSpace(query.Hall))
                bookingsQuery = bookingsQuery.Where(b => b.Hall == query.Hall);

            if (query.DateFrom.HasValue)
                bookingsQuery = bookingsQuery.Where(b => b.BookingDate >= query.DateFrom.Value);

            if (query.DateTo.HasValue)
            {
                var dateToExclusive = query.DateTo.Value.Date.AddDays(1);
                bookingsQuery = bookingsQuery.Where(b => b.BookingDate < dateToExclusive);
            }

            if (query.MinPrice.HasValue)
                bookingsQuery = bookingsQuery.Where(b => b.TotalPrice >= query.MinPrice.Value);

            if (query.MaxPrice.HasValue)
                bookingsQuery = bookingsQuery.Where(b => b.TotalPrice <= query.MaxPrice.Value);

            var totalCount = bookingsQuery.Count();
            var orderedQuery = ApplyBookingSorting(bookingsQuery, query);
            var bookings = orderedQuery
                .Skip(query.Skip)
                .Take(query.PageSize)
                .AsEnumerable()
                .Select(MapToDto)
                .ToList();

            var result = new PagedResult<BookingInfoDto>
            {
                Items = bookings,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totalCount
            };

            return new ServiceResponse { IsSuccess = true, Data = result };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BookingActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse GetBookingsByUserIdAction(int userId)
    {
        try
        {
            var bookings = _context.Bookings
                .Where(b => b.UserId == userId && !b.Deleted)
                .Select(b => MapToDto(b))
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = bookings };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BookingActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse UpdateBookingStatusAction(int id, string status)
    {
        try
        {
            var entity = _context.Bookings.FirstOrDefault(b => b.Id == id && !b.Deleted);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Booking not found" };

            entity.Status = status;
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Booking status updated successfully" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BookingActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse UpdateBookingAction(int id, BookingCreateDto bookingDto)
    {
        try
        {
            var entity = _context.Bookings.FirstOrDefault(b => b.Id == id && !b.Deleted);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Booking not found" };

            entity.CustomerEmail = bookingDto.CustomerEmail;
            entity.CustomerName = bookingDto.CustomerName;
            entity.TotalPrice = bookingDto.TotalPrice;
            entity.CustomerPhone = bookingDto.CustomerPhone;
            entity.Status = bookingDto.Status;
            
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Booking status updated successfully" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BookingActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse DeleteBookingAction(int id)
    {
        try
        {
            var entity = _context.Bookings.FirstOrDefault(b => b.Id == id);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Booking not found" };

            entity.Deleted = true;
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Booking deleted successfully" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BookingActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    private static BookingInfoDto MapToDto(BookingEntity entity)
    {
        return new BookingInfoDto
        {
            Id = entity.Id,
            MovieId = entity.MovieId,
            MovieTitle = entity.MovieTitle,
            CustomerName = entity.CustomerName,
            CustomerEmail = entity.CustomerEmail,
            CustomerPhone = entity.CustomerPhone,
            Hall = entity.Hall,
            Seats = JsonSerializer.Deserialize<string[]>(entity.Seats) ?? Array.Empty<string>(),
            Status = entity.Status,
            BookingDate = entity.BookingDate.ToString("yyyy-MM-dd"),
            Showtime = entity.Showtime,
            TotalPrice = TruncateToTwoDecimals(entity.TotalPrice),
            Deleted = entity.Deleted
        };
    }

    private static decimal TruncateToTwoDecimals(decimal value)
    {
        return Math.Truncate(value * 100) / 100;
    }

    private static IOrderedQueryable<BookingEntity> ApplyBookingSorting(IQueryable<BookingEntity> bookings, AdminListQuery query)
    {
        var sortBy = query.SortBy?.Trim().ToLowerInvariant();

        return (sortBy, query.SortDescending) switch
        {
            ("movietitle", true) => bookings.OrderByDescending(b => b.MovieTitle).ThenBy(b => b.Id),
            ("movietitle", false) => bookings.OrderBy(b => b.MovieTitle).ThenBy(b => b.Id),
            ("customername", true) => bookings.OrderByDescending(b => b.CustomerName).ThenBy(b => b.Id),
            ("customername", false) => bookings.OrderBy(b => b.CustomerName).ThenBy(b => b.Id),
            ("customeremail", true) => bookings.OrderByDescending(b => b.CustomerEmail).ThenBy(b => b.Id),
            ("customeremail", false) => bookings.OrderBy(b => b.CustomerEmail).ThenBy(b => b.Id),
            ("hall", true) => bookings.OrderByDescending(b => b.Hall).ThenBy(b => b.Id),
            ("hall", false) => bookings.OrderBy(b => b.Hall).ThenBy(b => b.Id),
            ("status", true) => bookings.OrderByDescending(b => b.Status).ThenBy(b => b.Id),
            ("status", false) => bookings.OrderBy(b => b.Status).ThenBy(b => b.Id),
            ("bookingdate", false) => bookings.OrderBy(b => b.BookingDate).ThenBy(b => b.Id),
            ("totalprice", true) => bookings.OrderByDescending(b => b.TotalPrice).ThenBy(b => b.Id),
            ("totalprice", false) => bookings.OrderBy(b => b.TotalPrice).ThenBy(b => b.Id),
            ("id", false) => bookings.OrderBy(b => b.Id),
            ("id", true) => bookings.OrderByDescending(b => b.Id),
            _ => bookings.OrderByDescending(b => b.BookingDate).ThenByDescending(b => b.Id)
        };
    }
}
