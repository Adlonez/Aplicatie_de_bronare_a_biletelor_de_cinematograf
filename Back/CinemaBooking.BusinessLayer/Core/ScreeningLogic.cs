using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.BusinessLayer.Structure;
using CinemaBooking.Domain.Models.Screening;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Core;

public class ScreeningLogic : ScreeningActions, IScreeningLogic
{
    public ServiceResponse CreateScreening(ScreeningCreateDto screening) => CreateScreeningAction(screening);
    public ServiceResponse GetScreeningById(int id) => GetScreeningByIdAction(id);
    public ServiceResponse GetScreeningList() => GetScreeningListAction();
    public ServiceResponse GetScreeningsByMovieId(int movieId) => GetScreeningsByMovieIdAction(movieId);
    public ServiceResponse UpdateScreening(int id, ScreeningCreateDto screening) => UpdateScreeningAction(id, screening);
    public ServiceResponse DeleteScreening(int id) => DeleteScreeningAction(id);
}
