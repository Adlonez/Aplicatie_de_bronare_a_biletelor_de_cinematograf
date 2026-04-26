using CinemaBooking.BusinessLayer.Core;
using CinemaBooking.BusinessLayer.Interfaces;

namespace CinemaBooking.BusinessLayer;

public class BusinessLogic
{
    public IFilmLogic GetFilmLogic() => new FilmLogic();
    public IScreeningLogic GetScreeningLogic() => new ScreeningLogic();
    public IBookingLogic GetBookingLogic() => new BookingLogic();
    public IUserLogic GetUserLogic() => new UserLogic();
    public IAuthLogic GetAuthLogic() => new AuthLogic();
    public IHallLogic GetHallLogic() => new HallLogic();
    public INewsLogic GetNewsLogic() => new NewsLogic();
    public IDashboardLogic GetDashboardLogic() => new DashboardLogic();
}
