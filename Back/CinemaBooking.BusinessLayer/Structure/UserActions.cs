using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Models.Service;
using CinemaBooking.Domain.Models.User;
using CinemaBooking.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;

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
            Console.WriteLine($"[UserActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse GetUserListAction()
    {
        try
        {
            var users = _context.Users
                .AsNoTracking()
                .Where(u => !u.Deleted)
                .Select(u => MapToDto(u))
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = users };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UserActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse GetUserListAction(AdminListQuery query)
    {
        try
        {
            var usersQuery = _context.Users
                .AsNoTracking()
                .Where(u => !u.Deleted);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();
                usersQuery = usersQuery.Where(u =>
                    u.Name.Contains(search) ||
                    u.Email.Contains(search) ||
                    u.Phone.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.Name))
            {
                var name = query.Name.Trim();
                usersQuery = usersQuery.Where(u => u.Name.Contains(name));
            }

            if (!string.IsNullOrWhiteSpace(query.Email))
            {
                var email = query.Email.Trim();
                usersQuery = usersQuery.Where(u => u.Email.Contains(email));
            }

            if (!string.IsNullOrWhiteSpace(query.Phone))
            {
                var phone = query.Phone.Trim();
                usersQuery = usersQuery.Where(u => u.Phone.Contains(phone));
            }

            if (!string.IsNullOrWhiteSpace(query.Status))
                usersQuery = usersQuery.Where(u => u.Status == query.Status);

            if (!string.IsNullOrWhiteSpace(query.Role))
                usersQuery = usersQuery.Where(u => u.Role == query.Role);

            if (query.DateFrom.HasValue)
                usersQuery = usersQuery.Where(u => u.RegistrationDate >= query.DateFrom.Value);

            if (query.DateTo.HasValue)
            {
                var dateToExclusive = query.DateTo.Value.Date.AddDays(1);
                usersQuery = usersQuery.Where(u => u.RegistrationDate < dateToExclusive);
            }

            var totalCount = usersQuery.Count();
            var orderedQuery = ApplyUserSorting(usersQuery, query);
            var users = orderedQuery
                .Skip(query.Skip)
                .Take(query.PageSize)
                .AsEnumerable()
                .Select(MapToDto)
                .ToList();

            var result = new PagedResult<UserInfoDto>
            {
                Items = users,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totalCount
            };

            return new ServiceResponse { IsSuccess = true, Data = result };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UserActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
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
            Console.WriteLine($"[UserActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
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
            Console.WriteLine($"[UserActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
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

    private static IOrderedQueryable<UserEntity> ApplyUserSorting(IQueryable<UserEntity> users, AdminListQuery query)
    {
        var sortBy = query.SortBy?.Trim().ToLowerInvariant();

        return (sortBy, query.SortDescending) switch
        {
            ("name", true) => users.OrderByDescending(u => u.Name).ThenBy(u => u.Id),
            ("name", false) => users.OrderBy(u => u.Name).ThenBy(u => u.Id),
            ("email", true) => users.OrderByDescending(u => u.Email).ThenBy(u => u.Id),
            ("email", false) => users.OrderBy(u => u.Email).ThenBy(u => u.Id),
            ("phone", true) => users.OrderByDescending(u => u.Phone).ThenBy(u => u.Id),
            ("phone", false) => users.OrderBy(u => u.Phone).ThenBy(u => u.Id),
            ("role", true) => users.OrderByDescending(u => u.Role).ThenBy(u => u.Id),
            ("role", false) => users.OrderBy(u => u.Role).ThenBy(u => u.Id),
            ("status", true) => users.OrderByDescending(u => u.Status).ThenBy(u => u.Id),
            ("status", false) => users.OrderBy(u => u.Status).ThenBy(u => u.Id),
            ("registrationdate", false) => users.OrderBy(u => u.RegistrationDate).ThenBy(u => u.Id),
            ("id", true) => users.OrderByDescending(u => u.Id),
            _ => users.OrderByDescending(u => u.RegistrationDate).ThenByDescending(u => u.Id)
        };
    }
}
