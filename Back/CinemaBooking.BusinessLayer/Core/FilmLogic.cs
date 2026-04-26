using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.BusinessLayer.Structure;
using CinemaBooking.Domain.Models.Film;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Core;

public class FilmLogic : FilmActions, IFilmLogic
{
    public ServiceResponse CreateFilm(FilmCreateDto film) => CreateFilmAction(film);
    public ServiceResponse GetFilmById(int id) => GetFilmByIdAction(id);
    public ServiceResponse GetFilmList() => GetFilmListAction();
    public ServiceResponse GetFilmList(AdminListQuery query) => GetFilmListAction(query);
    public ServiceResponse UpdateFilm(int id, FilmCreateDto film) => UpdateFilmAction(id, film);
    public ServiceResponse DeleteFilm(int id) => DeleteFilmAction(id);
}
