using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.BusinessLayer.Structure;
using CinemaBooking.Domain.Models.Auth;
using CinemaBooking.Domain.Models.Service;
using CinemaBooking.Domain.Models.User;

namespace CinemaBooking.BusinessLayer.Core;

public class AuthLogic : AuthActions, IAuthLogic
{
    public ServiceResponse Register(UserCreateDto user) => RegisterAction(user);
    public ServiceResponse Login(LoginDto login) => LoginAction(login);
}
