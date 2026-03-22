using CinemaBooking.Domain.Models.Screening;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Interfaces;

public interface IScreeningLogic
{
    ServiceResponse CreateScreening(ScreeningCreateDto screening);
    ServiceResponse GetScreeningById(int id);
    ServiceResponse GetScreeningList();
    ServiceResponse GetScreeningsByMovieId(int movieId);
    ServiceResponse UpdateScreening(int id, ScreeningCreateDto screening);
    ServiceResponse DeleteScreening(int id);
}
