using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Entities.User;
using CinemaBooking.Domain.Models.Auth;
using CinemaBooking.Domain.Models.Service;
using CinemaBooking.Domain.Models.User;
using Microsoft.IdentityModel.Tokens;

namespace CinemaBooking.BusinessLayer.Structure;

public class AuthActions
{
    protected readonly CinemaDbContext _context = new();

    // TODO: Move this to appsettings.json configuration
    private const string JwtSecret = "CinemaBookingSecretKey_ChangeThis_InProduction_2024!";
    private const string JwtIssuer = "CinemaBooking";
    private const string JwtAudience = "CinemaBookingApp";

    protected ServiceResponse RegisterAction(UserCreateDto dto)
    {
        try
        {
            var existingUser = _context.Users.FirstOrDefault(u => u.Email == dto.Email);
            if (existingUser != null)
                return new ServiceResponse { IsSuccess = false, Message = "Email already registered" };

            var entity = new UserEntity
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "user",
                Status = "active",
                RegistrationDate = DateTime.UtcNow
            };

            _context.Users.Add(entity);
            _context.SaveChanges();

            var token = GenerateJwtToken(entity);

            return new ServiceResponse
            {
                IsSuccess = true,
                Message = "Registration successful",
                Data = new AuthResponseDto
                {
                    Token = token,
                    Name = entity.Name,
                    Email = entity.Email,
                    Role = entity.Role
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse LoginAction(LoginDto dto)
    {
        try
        {
            var entity = _context.Users.FirstOrDefault(u => u.Email == dto.Email && !u.Deleted);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Invalid email or password" };

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, entity.PasswordHash))
                return new ServiceResponse { IsSuccess = false, Message = "Invalid email or password" };

            if (entity.Status == "inactive")
                return new ServiceResponse { IsSuccess = false, Message = "Account is inactive" };

            var token = GenerateJwtToken(entity);

            return new ServiceResponse
            {
                IsSuccess = true,
                Message = "Login successful",
                Data = new AuthResponseDto
                {
                    Token = token,
                    Name = entity.Name,
                    Email = entity.Email,
                    Role = entity.Role
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    private static string GenerateJwtToken(UserEntity user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: JwtIssuer,
            audience: JwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
