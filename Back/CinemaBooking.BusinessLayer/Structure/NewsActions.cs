using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Entities.News;
using CinemaBooking.Domain.Models.News;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Structure;

public class NewsActions
{
    protected readonly CinemaDbContext _context = new();

    protected ServiceResponse CreateNewsAction(NewsCreateDto dto)
    {
        try
        {
            var entity = new NewsEntity
            {
                Title = dto.Title,
                Date = DateTime.UtcNow,
                Category = dto.Category,
                Content = dto.Content,
                Image = dto.Image,
                FullContent = dto.FullContent
            };

            _context.News.Add(entity);
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "News created successfully", Data = entity.Id };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetNewsByIdAction(int id)
    {
        try
        {
            var entity = _context.News.FirstOrDefault(n => n.Id == id);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "News not found" };

            return new ServiceResponse { IsSuccess = true, Data = MapToDto(entity) };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse GetNewsListAction()
    {
        try
        {
            var news = _context.News
                .OrderByDescending(n => n.Date)
                .Select(n => MapToDto(n))
                .ToList();

            return new ServiceResponse { IsSuccess = true, Data = news };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse UpdateNewsAction(int id, NewsCreateDto dto)
    {
        try
        {
            var entity = _context.News.FirstOrDefault(n => n.Id == id);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "News not found" };

            entity.Title = dto.Title;
            entity.Category = dto.Category;
            entity.Content = dto.Content;
            entity.Image = dto.Image;
            entity.FullContent = dto.FullContent;

            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "News updated successfully" };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    protected ServiceResponse DeleteNewsAction(int id)
    {
        try
        {
            var entity = _context.News.FirstOrDefault(n => n.Id == id);
            if (entity == null)
                return new ServiceResponse { IsSuccess = false, Message = "News not found" };

            _context.News.Remove(entity);
            _context.SaveChanges();

            return new ServiceResponse { IsSuccess = true, Message = "News deleted successfully" };
        }
        catch (Exception ex)
        {
            return new ServiceResponse { IsSuccess = false, Message = ex.Message };
        }
    }

    private static NewsInfoDto MapToDto(NewsEntity entity)
    {
        return new NewsInfoDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Date = entity.Date.ToString("yyyy-MM-dd"),
            Category = entity.Category,
            Content = entity.Content,
            Image = entity.Image,
            FullContent = entity.FullContent
        };
    }
}
