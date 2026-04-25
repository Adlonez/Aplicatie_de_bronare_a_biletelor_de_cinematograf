using CinemaBooking.Domain.Models.Booking;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Interfaces;

public interface IBookingLogic
{
    ServiceResponse CreateBooking(BookingCreateDto booking);
    ServiceResponse GetBookingById(int id);
    ServiceResponse GetBookingList();
    ServiceResponse GetBookingsByUserId(int userId);
    ServiceResponse UpdateBookingStatus(int id, string status);
    ServiceResponse UpdateBooking(int id, BookingCreateDto bookingDto);
    ServiceResponse DeleteBooking(int id);
}
