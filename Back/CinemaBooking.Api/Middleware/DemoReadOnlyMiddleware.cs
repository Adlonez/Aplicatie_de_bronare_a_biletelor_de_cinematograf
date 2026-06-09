using System.Security.Claims;

namespace CinemaBooking.Api.Middleware;

public class DemoReadOnlyMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly string[] DemoEmails = { "admin_demo@demo.com", "user_demo@demo.com" };

    public DemoReadOnlyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var method = context.Request.Method;
        
        // If it's a mutation request
        if (method == HttpMethods.Post || method == HttpMethods.Put || method == HttpMethods.Delete || method == HttpMethods.Patch)
        {
            var userEmail = context.User?.FindFirst(ClaimTypes.Email)?.Value 
                            ?? context.User?.FindFirst("email")?.Value;

            if (userEmail != null && DemoEmails.Contains(userEmail))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { 
                    message = "Action denied: Demo user cannot modify data.",
                    isSuccess = false 
                });
                return;
            }
        }

        await _next(context);
    }
}
