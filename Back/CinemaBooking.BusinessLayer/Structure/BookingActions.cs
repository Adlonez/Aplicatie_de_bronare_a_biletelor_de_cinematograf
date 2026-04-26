using System.Text.Json;
using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Entities.Booking;
using CinemaBooking.Domain.Models.Booking;
using CinemaBooking.Domain.Models.Service;

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
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
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
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetBookingListAction()
    {
        try
        {
            var bookings = _context.Bookings
                .Where(b => !b.Deleted)
                .Select(b => MapToDto(b))
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = bookings };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
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
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
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
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
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
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
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
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
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
}
