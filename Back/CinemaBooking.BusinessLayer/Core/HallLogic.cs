using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.BusinessLayer.Structure;
using CinemaBooking.Domain.Models.Hall;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Core;

public class HallLogic : HallActions, IHallLogic
{
    public ServiceResponse CreateHall(HallCreateDto hall) => CreateHallAction(hall);
    public ServiceResponse GetHallById(int id) => GetHallByIdAction(id);
    public ServiceResponse GetHallList() => GetHallListAction();
    public ServiceResponse UpdateHall(int id, HallCreateDto hall) => UpdateHallAction(id, hall);
    public ServiceResponse DeleteHall(int id) => DeleteHallAction(id);
}
