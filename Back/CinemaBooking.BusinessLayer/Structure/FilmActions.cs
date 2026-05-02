using System.Text.Json;
using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Entities.Film;
using CinemaBooking.Domain.Models.Film;
using CinemaBooking.Domain.Models.Service;
using Microsoft.EntityFrameworkCore;

namespace CinemaBooking.BusinessLayer.Structure;

public class FilmActions
{
    protected readonly CinemaDbContext _context = new();

    protected ServiceResponse CreateFilmAction(FilmCreateDto dto)
    {
        try
        {
            var entity = new FilmEntity
            {
                Title = dto.Title,
                Poster = dto.Poster,
                Image = dto.Image,
                Description = dto.Description,
                Href = dto.Href,
                Format = dto.Format,
                Languages = JsonSerializer.Serialize(dto.Languages),
                Status = dto.Status,
                Toptier = dto.Toptier,
                Duration = dto.Duration,
                Genre = dto.Genre,
                ReleaseDate = dto.ReleaseDate != null ? DateTime.Parse(dto.ReleaseDate) : null,
                ScreeningPeriodStart = dto.ScreeningPeriodStart != null ? DateTime.Parse(dto.ScreeningPeriodStart) : null,
                ScreeningPeriodEnd = dto.ScreeningPeriodEnd != null ? DateTime.Parse(dto.ScreeningPeriodEnd) : null,
            };

            _context.Films.Add(entity);
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Film created successfully", Data = entity.Id };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[FilmActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse GetFilmByIdAction(int id)
    {
        try
        {
            var entity = _context.Films.FirstOrDefault(f => f.Id == id && !f.Deleted);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Film not found" };

            return new ServiceResponse { IsSuccess = true, Data = MapToDto(entity) };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[FilmActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse GetFilmListAction()
    {
        try
        {
            var films = _context.Films
                .AsNoTracking()
                .Where(f => !f.Deleted)
                .Select(f => MapToDto(f))
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = films };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[FilmActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse GetFilmListAction(AdminListQuery query)
    {
        try
        {
            var filmsQuery = _context.Films
                .AsNoTracking()
                .Where(f => !f.Deleted);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.Trim();
                filmsQuery = filmsQuery.Where(f =>
                    f.Title.Contains(search) ||
                    (f.Genre != null && f.Genre.Contains(search)) ||
                    f.Description.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.Status))
                filmsQuery = filmsQuery.Where(f => f.Status == query.Status);

            if (!string.IsNullOrWhiteSpace(query.Genre))
                filmsQuery = filmsQuery.Where(f => f.Genre != null && f.Genre.Contains(query.Genre));

            if (!string.IsNullOrWhiteSpace(query.Format))
                filmsQuery = filmsQuery.Where(f => f.Format == query.Format);

            if (query.DateFrom.HasValue)
                filmsQuery = filmsQuery.Where(f => f.ReleaseDate >= query.DateFrom.Value);

            if (query.DateTo.HasValue)
            {
                var dateToExclusive = query.DateTo.Value.Date.AddDays(1);
                filmsQuery = filmsQuery.Where(f => f.ReleaseDate < dateToExclusive);
            }

            if (query.MinDuration.HasValue)
                filmsQuery = filmsQuery.Where(f => f.Duration >= query.MinDuration.Value);

            if (query.MaxDuration.HasValue)
                filmsQuery = filmsQuery.Where(f => f.Duration <= query.MaxDuration.Value);

            var totalCount = filmsQuery.Count();
            var orderedQuery = ApplyFilmSorting(filmsQuery, query);
            var films = orderedQuery
                .Skip(query.Skip)
                .Take(query.PageSize)
                .AsEnumerable()
                .Select(MapToDto)
                .ToList();

            var result = new PagedResult<FilmInfoDto>
            {
                Items = films,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totalCount
            };

            return new ServiceResponse { IsSuccess = true, Data = result };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[FilmActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse UpdateFilmAction(int id, FilmCreateDto dto)
    {
        try
        {
            var entity = _context.Films.FirstOrDefault(f => f.Id == id && !f.Deleted);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Film not found" };

            entity.Title = dto.Title;
            entity.Poster = dto.Poster;
            entity.Image = dto.Image;
            entity.Description = dto.Description;
            entity.Href = dto.Href;
            entity.Format = dto.Format;
            entity.Languages = JsonSerializer.Serialize(dto.Languages);
            entity.Status = dto.Status;
            entity.Toptier = dto.Toptier;
            entity.Duration = dto.Duration;
            entity.Genre = dto.Genre;
            entity.ReleaseDate = dto.ReleaseDate != null ? DateTime.Parse(dto.ReleaseDate) : null;
            entity.ScreeningPeriodStart = dto.ScreeningPeriodStart != null ? DateTime.Parse(dto.ScreeningPeriodStart) : null;
            entity.ScreeningPeriodEnd = dto.ScreeningPeriodEnd != null ? DateTime.Parse(dto.ScreeningPeriodEnd) : null;

            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Film updated successfully" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[FilmActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    protected ServiceResponse DeleteFilmAction(int id)
    {
        try
        {
            var entity = _context.Films.FirstOrDefault(f => f.Id == id);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "Film not found" };

            entity.Deleted = true;
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "Film deleted successfully" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[FilmActions Error] {ex.Message} {ex.InnerException?.Message}");
            return new ServiceResponse { IsSuccess = false, Message = $"{ex.Message} {(ex.InnerException != null ? "| " + ex.InnerException.Message : "")}" };
        }
    }

    private static FilmInfoDto MapToDto(FilmEntity entity)
    {
        return new FilmInfoDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Poster = entity.Poster,
            Image = entity.Image,
            Description = entity.Description,
            Href = entity.Href,
            Format = entity.Format,
            Languages = JsonSerializer.Deserialize<string[]>(entity.Languages) ?? Array.Empty<string>(),
            Status = entity.Status,
            Toptier = entity.Toptier,
            Duration = entity.Duration,
            Genre = entity.Genre,
            ReleaseDate = entity.ReleaseDate?.ToString("yyyy-MM-dd"),
            ScreeningPeriod = entity.ScreeningPeriodStart != null ? new ScreeningPeriodDto
            {
                Start = entity.ScreeningPeriodStart.Value.ToString("yyyy-MM-dd"),
                End = entity.ScreeningPeriodEnd?.ToString("yyyy-MM-dd") ?? ""
            } : null,
            Deleted = entity.Deleted
        };
    }

    private static IOrderedQueryable<FilmEntity> ApplyFilmSorting(IQueryable<FilmEntity> films, AdminListQuery query)
    {
        var sortBy = query.SortBy?.Trim().ToLowerInvariant();

        return (sortBy, query.SortDescending) switch
        {
            ("title", true) => films.OrderByDescending(f => f.Title).ThenBy(f => f.Id),
            ("title", false) => films.OrderBy(f => f.Title).ThenBy(f => f.Id),
            ("genre", true) => films.OrderByDescending(f => f.Genre).ThenBy(f => f.Id),
            ("genre", false) => films.OrderBy(f => f.Genre).ThenBy(f => f.Id),
            ("duration", true) => films.OrderByDescending(f => f.Duration).ThenBy(f => f.Id),
            ("duration", false) => films.OrderBy(f => f.Duration).ThenBy(f => f.Id),
            ("releasedate", true) => films.OrderByDescending(f => f.ReleaseDate).ThenBy(f => f.Id),
            ("releasedate", false) => films.OrderBy(f => f.ReleaseDate).ThenBy(f => f.Id),
            ("status", true) => films.OrderByDescending(f => f.Status).ThenBy(f => f.Id),
            ("status", false) => films.OrderBy(f => f.Status).ThenBy(f => f.Id),
            ("id", true) => films.OrderByDescending(f => f.Id),
            _ => films.OrderBy(f => f.Id)
        };
    }
}
