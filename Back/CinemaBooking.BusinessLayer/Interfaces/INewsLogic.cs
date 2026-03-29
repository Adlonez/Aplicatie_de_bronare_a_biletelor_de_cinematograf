using CinemaBooking.Domain.Models.News;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Interfaces;

public interface INewsLogic
{
    ServiceResponse CreateNews(NewsCreateDto news);
    ServiceResponse GetNewsById(int id);
    ServiceResponse GetNewsList();
    ServiceResponse UpdateNews(int id, NewsCreateDto news);
    ServiceResponse DeleteNews(int id);
}
