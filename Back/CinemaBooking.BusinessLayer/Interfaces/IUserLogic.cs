using CinemaBooking.Domain.Models.Service;
using CinemaBooking.Domain.Models.User;

namespace CinemaBooking.BusinessLayer.Interfaces;

public interface IUserLogic
{
    ServiceResponse GetUserById(int id);
    ServiceResponse GetUserList();
    ServiceResponse GetUserList(AdminListQuery query);
    ServiceResponse UpdateUserStatus(int id, string status);
    ServiceResponse DeleteUser(int id);
}
