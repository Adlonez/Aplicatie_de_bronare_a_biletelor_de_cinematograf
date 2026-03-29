using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.BusinessLayer.Structure;
using CinemaBooking.Domain.Models.Booking;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Core;

public class BookingLogic : BookingActions, IBookingLogic
{
    public ServiceResponse CreateBooking(BookingCreateDto booking) => CreateBookingAction(booking);
    public ServiceResponse GetBookingById(int id) => GetBookingByIdAction(id);
    public ServiceResponse GetBookingList() => GetBookingListAction();
    public ServiceResponse GetBookingsByUserId(int userId) => GetBookingsByUserIdAction(userId);
    public ServiceResponse UpdateBookingStatus(int id, string status) => UpdateBookingStatusAction(id, status);
    public ServiceResponse DeleteBooking(int id) => DeleteBookingAction(id);
}
