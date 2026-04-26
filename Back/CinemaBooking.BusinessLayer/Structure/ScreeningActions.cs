using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Entities.Screening;
using CinemaBooking.Domain.Models.Screening;
using CinemaBooking.Domain.Models.Service;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.BusinessLayer.Structure;

public class ScreeningActions
{
    protected readonly CinemaDbContext _context = new();

    protected ServiceResponse CreateScreeningAction(ScreeningCreateDto dto)
    {
        try
        {
            var entity = new ScreeningEntity
            {
                MovieId = dto.MovieId,
                MovieTitle = dto.MovieTitle,
                Hall = dto.Hall,
                Date = DateTime.Parse(dto.Date),
                Time = dto.Time
            };

            _context.Screenings.Add(entity);
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Screening created successfully", Data = entity.Id };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetScreeningByIdAction(int id)
    {
        try
        {
            var entity = _context.Screenings.FirstOrDefault(s => s.Id == id && !s.Deleted);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Screening not found" };

            return new ServiceResponse { IsSuccess = true, Data = MapToDto(entity) };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetScreeningListAction()
    {
        try
        {
            var screenings = _context.Screenings
                .AsNoTracking()
                .Where(s => !s.Deleted)
                .Select(s => MapToDto(s))
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = screenings };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetScreeningListAction(AdminListQuery query)
    {
        try
        {
            var screeningsQuery = _context.Screenings
                .AsNoTracking()
                .Where(s => !s.Deleted);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();
                screeningsQuery = screeningsQuery.Where(s =>
                    s.MovieTitle.Contains(search) ||
                    s.Hall.Contains(search) ||
                    s.Time.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.Hall))
                screeningsQuery = screeningsQuery.Where(s => s.Hall == query.Hall);

            if (query.Halls is { Length: > 0 })
                screeningsQuery = screeningsQuery.Where(s => query.Halls.Contains(s.Hall));

            if (query.DateFrom.HasValue)
                screeningsQuery = screeningsQuery.Where(s => s.Date >= query.DateFrom.Value);

            if (query.DateTo.HasValue)
            {
                var dateToExclusive = query.DateTo.Value.Date.AddDays(1);
                screeningsQuery = screeningsQuery.Where(s => s.Date < dateToExclusive);
            }

            if (!string.IsNullOrWhiteSpace(query.TimeFrom))
                screeningsQuery = screeningsQuery.Where(s => string.Compare(s.Time, query.TimeFrom) >= 0);

            if (!string.IsNullOrWhiteSpace(query.TimeTo))
                screeningsQuery = screeningsQuery.Where(s => string.Compare(s.Time, query.TimeTo) <= 0);

            var totalCount = screeningsQuery.Count();
            var orderedQuery = ApplyScreeningSorting(screeningsQuery, query);
            var screenings = orderedQuery
                .Skip(query.Skip)
                .Take(query.PageSize)
                .AsEnumerable()
                .Select(MapToDto)
                .ToList();

            var result = new PagedResult<ScreeningInfoDto>
            {
                Items = screenings,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totalCount
            };

            return new ServiceResponse { IsSuccess = true, Data = result };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetScreeningsByMovieIdAction(int movieId)
    {
        try
        {
            var screenings = _context.Screenings
                .Where(s => s.MovieId == movieId && !s.Deleted)
                .Select(s => MapToDto(s))
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = screenings };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse UpdateScreeningAction(int id, ScreeningCreateDto dto)
    {
        try
        {
            var entity = _context.Screenings.FirstOrDefault(s => s.Id == id && !s.Deleted);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Screening not found" };

            entity.MovieId = dto.MovieId;
            entity.MovieTitle = dto.MovieTitle;
            entity.Hall = dto.Hall;
            entity.Date = DateTime.Parse(dto.Date);
            entity.Time = dto.Time;

            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Screening updated successfully" };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse DeleteScreeningAction(int id)
    {
        try
        {
            var entity = _context.Screenings.FirstOrDefault(s => s.Id == id);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Screening not found" };

            entity.Deleted = true;
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Screening deleted successfully" };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    private static ScreeningInfoDto MapToDto(ScreeningEntity entity)
    {
        return new ScreeningInfoDto
        {
            Id = entity.Id,
            MovieId = entity.MovieId,
            MovieTitle = entity.MovieTitle,
            Hall = entity.Hall,
            Date = entity.Date.ToString("yyyy-MM-dd"),
            Time = entity.Time,
            Deleted = entity.Deleted
        };
    }

    private static IOrderedQueryable<ScreeningEntity> ApplyScreeningSorting(IQueryable<ScreeningEntity> screenings, AdminListQuery query)
    {
        var sortBy = query.SortBy?.Trim().ToLowerInvariant();

        return (sortBy, query.SortDescending) switch
        {
            ("movietitle", true) => screenings.OrderByDescending(s => s.MovieTitle).ThenBy(s => s.Id),
            ("movietitle", false) => screenings.OrderBy(s => s.MovieTitle).ThenBy(s => s.Id),
            ("hall", true) => screenings.OrderByDescending(s => s.Hall).ThenBy(s => s.Id),
            ("hall", false) => screenings.OrderBy(s => s.Hall).ThenBy(s => s.Id),
            ("date", true) => screenings.OrderByDescending(s => s.Date).ThenBy(s => s.Time).ThenBy(s => s.Id),
            ("date", false) => screenings.OrderBy(s => s.Date).ThenBy(s => s.Time).ThenBy(s => s.Id),
            ("time", true) => screenings.OrderByDescending(s => s.Time).ThenBy(s => s.Id),
            ("time", false) => screenings.OrderBy(s => s.Time).ThenBy(s => s.Id),
            ("id", true) => screenings.OrderByDescending(s => s.Id),
            _ => screenings.OrderBy(s => s.Date).ThenBy(s => s.Time).ThenBy(s => s.Id)
        };
    }
}
