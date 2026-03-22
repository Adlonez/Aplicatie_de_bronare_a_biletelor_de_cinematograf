using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.BusinessLayer.Structure;
using CinemaBooking.Domain.Models.Service;
using CinemaBooking.Domain.Models.User;

namespace CinemaBooking.BusinessLayer.Core;

public class UserLogic : UserActions, IUserLogic
{
    public ServiceResponse GetUserById(int id) => GetUserByIdAction(id);
    public ServiceResponse GetUserList() => GetUserListAction();
    public ServiceResponse UpdateUserStatus(int id, string status) => UpdateUserStatusAction(id, status);
    public ServiceResponse DeleteUser(int id) => DeleteUserAction(id);
}
