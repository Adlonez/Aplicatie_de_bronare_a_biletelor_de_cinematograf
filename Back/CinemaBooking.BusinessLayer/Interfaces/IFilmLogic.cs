using CinemaBooking.Domain.Models.Film;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Interfaces;

public interface IFilmLogic
{
    ServiceResponse CreateFilm(FilmCreateDto film);
    ServiceResponse GetFilmById(int id);
    ServiceResponse GetFilmList();
    ServiceResponse GetFilmList(AdminListQuery query);
    ServiceResponse UpdateFilm(int id, FilmCreateDto film);
    ServiceResponse DeleteFilm(int id);
}
