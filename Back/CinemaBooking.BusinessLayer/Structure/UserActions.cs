using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Models.Service;
using CinemaBooking.Domain.Models.User;
using CinemaBooking.Domain.Entities.User;

namespace CinemaBooking.BusinessLayer.Structure;

public class UserActions
{
    protected readonly CinemaDbContext _context = new();

    protected ServiceResponse GetUserByIdAction(int id)
    {
        try
        {
            var entity = _context.Users.FirstOrDefault(u => u.Id == id && !u.Deleted);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "User not found" };

            return new ServiceResponse { IsSuccess = true, Data = MapToDto(entity) };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetUserListAction()
    {
        try
        {
            var users = _context.Users
                .Where(u => !u.Deleted)
                .Select(u => MapToDto(u))
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = users };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse UpdateUserStatusAction(int id, string status)
    {
        try
        {
            var entity = _context.Users.FirstOrDefault(u => u.Id == id && !u.Deleted);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "User not found" };

            entity.Status = status;
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "User status updated successfully" };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse DeleteUserAction(int id)
    {
        try
        {
            var entity = _context.Users.FirstOrDefault(u => u.Id == id);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "User not found" };

            entity.Deleted = true;
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "User deleted successfully" };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected static UserInfoDto MapToDto(UserEntity entity)
    {
        return new UserInfoDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Email = entity.Email,
            Phone = entity.Phone,
            Status = entity.Status,
            RegistrationDate = entity.RegistrationDate.ToString("yyyy-MM-dd"),
            Role = entity.Role,
            Deleted = entity.Deleted
        };
    }
}
