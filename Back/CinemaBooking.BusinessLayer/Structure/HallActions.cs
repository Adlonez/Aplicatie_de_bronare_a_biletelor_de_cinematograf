using System.Text.Json;
using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Entities.Hall;
using CinemaBooking.Domain.Models.Hall;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Structure;

public class HallActions
{
    protected readonly CinemaDbContext _context = new();

    protected ServiceResponse CreateHallAction(HallCreateDto dto)
    {
        try
        {
            var entity = new HallEntity
            {
                Name = dto.Name,
                Capacity = dto.Capacity,
                Features = JsonSerializer.Serialize(dto.Features),
                SeatMap = JsonSerializer.Serialize(dto.SeatMap)
            };

            _context.Halls.Add(entity);
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Hall created successfully", Data = entity.Id };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetHallByIdAction(int id)
    {
        try
        {
            var entity = _context.Halls.FirstOrDefault(h => h.Id == id);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Hall not found" };

            return new ServiceResponse { IsSuccess = true, Data = MapToDto(entity) };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetHallListAction()
    {
        try
        {
            var halls = _context.Halls
                .Select(h => MapToDto(h))
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = halls };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse UpdateHallAction(int id, HallCreateDto dto)
    {
        try
        {
            var entity = _context.Halls.FirstOrDefault(h => h.Id == id);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Hall not found" };

            entity.Name = dto.Name;
            entity.Capacity = dto.Capacity;
            entity.Features = JsonSerializer.Serialize(dto.Features);
            entity.SeatMap = JsonSerializer.Serialize(dto.SeatMap);

            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Hall updated successfully" };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse DeleteHallAction(int id)
    {
        try
        {
            var entity = _context.Halls.FirstOrDefault(h => h.Id == id);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Hall not found" };

            _context.Halls.Remove(entity);
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Hall deleted successfully" };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    private static HallInfoDto MapToDto(HallEntity entity)
    {
        return new HallInfoDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Capacity = entity.Capacity,
            Features = JsonSerializer.Deserialize<string[]>(entity.Features) ?? Array.Empty<string>(),
            SeatMap = JsonSerializer.Deserialize<SeatMapDto>(entity.SeatMap) ?? new SeatMapDto()
        };
    }
}
