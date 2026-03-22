using CinemaBooking.BusinessLayer.Interfaces;
using CinemaBooking.BusinessLayer.Structure;
using CinemaBooking.Domain.Models.News;
using CinemaBooking.Domain.Models.Service;

namespace CinemaBooking.BusinessLayer.Core;

public class NewsLogic : NewsActions, INewsLogic
{
    public ServiceResponse CreateNews(NewsCreateDto news) => CreateNewsAction(news);
    public ServiceResponse GetNewsById(int id) => GetNewsByIdAction(id);
    public ServiceResponse GetNewsList() => GetNewsListAction();
    public ServiceResponse UpdateNews(int id, NewsCreateDto news) => UpdateNewsAction(id, news);
    public ServiceResponse DeleteNews(int id) => DeleteNewsAction(id);
}
