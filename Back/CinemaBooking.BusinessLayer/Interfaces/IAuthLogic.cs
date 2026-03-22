using CinemaBooking.Domain.Models.Auth;
using CinemaBooking.Domain.Models.Service;
using CinemaBooking.Domain.Models.User;

namespace CinemaBooking.BusinessLayer.Interfaces;

public interface IAuthLogic
{
    ServiceResponse Register(UserCreateDto user);
    ServiceResponse Login(LoginDto login);
}
