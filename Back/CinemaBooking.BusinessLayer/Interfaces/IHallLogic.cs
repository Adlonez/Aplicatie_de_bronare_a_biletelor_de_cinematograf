using CinemaBooking.Domain.Models.Hall;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Interfaces;

public interface IHallLogic
{
    ServiceResponse CreateHall(HallCreateDto hall);
    ServiceResponse GetHallById(int id);
    ServiceResponse GetHallList();
    ServiceResponse UpdateHall(int id, HallCreateDto hall);
    ServiceResponse DeleteHall(int id);
}
