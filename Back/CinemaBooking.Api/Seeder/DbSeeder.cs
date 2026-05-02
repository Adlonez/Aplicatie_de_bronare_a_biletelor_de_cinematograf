// Transfer data from mock to the database(if empty)
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using CinemaBooking.DataAccessLayer.Context;
using CinemaBooking.Domain.Entities.Booking;
using CinemaBooking.Domain.Entities.Film;
using CinemaBooking.Domain.Entities.Hall;
using CinemaBooking.Domain.Entities.News;
using CinemaBooking.Domain.Entities.Screening;
using CinemaBooking.Domain.Entities.User;

namespace CinemaBooking.Api.Seeder;

public static class DbSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static void Seed(CinemaDbContext context)
    {
        using var context = new CinemaDbContext();

        // Wait for the database to be ready (retry up to 10 times)
        var retries = 0;
        const int maxRetries = 10;
        while (retries < maxRetries)
        {
            try
            {
                if (context.Database.CanConnect()) break;
            }
            catch
            {
                // Ignore exceptions and retry
            }
            retries++;
            Console.WriteLine($"[DbSeeder] Waiting for database... (Attempt {retries}/{maxRetries})");
            Thread.Sleep(2000);
        }

        if (retries == maxRetries)
        {
            Console.WriteLine("[DbSeeder] Could not connect to database after several attempts. Skipping seed.");
            return;
        }

        // Only seed if database is empty
        if (context.Films.Any()) return;

        // dotnet run sets CWD to the project folder (Back/CinemaBooking.Api/), so go up two levels
        var seedsPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "Front", "src", "_mock"));

        SeedFilms(context, seedsPath);
        SeedHalls(context, seedsPath);
        SeedNews(context, seedsPath);
        SeedScreenings(context, seedsPath);
        SeedAdminUser(context);
        SeedUsers(context, seedsPath);
        SeedBookings(context, seedsPath);

        Console.WriteLine("[DbSeeder] Database seeded successfully.");
    }

    // ── Films ─────────────────────────────────────────────────────────────

    private static void SeedFilms(CinemaDbContext context, string seedsPath)
    {
        var json = File.ReadAllText(Path.Combine(seedsPath, "films.json"));
        var items = JsonSerializer.Deserialize<List<FilmSeedModel>>(json, JsonOptions) ?? [];

        foreach (var item in items)
        {
            context.Films.Add(new FilmEntity
            {
                Title = item.Title,
                Poster = item.Poster,
                Image = item.Image,
                Description = item.Description,
                Href = item.Href,
                Format = item.Format,
                Languages = JsonSerializer.Serialize(item.Languages),
                Status = item.Status,
                Toptier = item.Toptier,
                Duration = item.Duration,
                Genre = item.Genre,
                ReleaseDate = item.ReleaseDate != null ? DateTime.Parse(item.ReleaseDate) : null,
                ScreeningPeriodStart = item.ScreeningPeriod?.Start != null ? DateTime.Parse(item.ScreeningPeriod.Start) : null,
                ScreeningPeriodEnd = item.ScreeningPeriod?.End != null ? DateTime.Parse(item.ScreeningPeriod.End) : null,
            });
        }

        context.SaveChanges();
        Console.WriteLine($"[DbSeeder] Seeded {items.Count} films.");
    }

    // ── Halls ─────────────────────────────────────────────────────────────

    private static void SeedHalls(CinemaDbContext context, string seedsPath)
    {
        var json = File.ReadAllText(Path.Combine(seedsPath, "halls.json"));
        var items = JsonSerializer.Deserialize<List<HallSeedModel>>(json, JsonOptions) ?? [];

        foreach (var item in items)
        {
            context.Halls.Add(new HallEntity
            {
                Name = item.Name,
                Capacity = item.Capacity,
                Features = JsonSerializer.Serialize(item.Features),
                SeatMap = JsonSerializer.Serialize(item.SeatMap),
            });
        }

        context.SaveChanges();
        Console.WriteLine($"[DbSeeder] Seeded {items.Count} halls.");
    }

    // ── News ──────────────────────────────────────────────────────────────

    private static void SeedNews(CinemaDbContext context, string seedsPath)
    {
        var json = File.ReadAllText(Path.Combine(seedsPath, "news.json"));
        var items = JsonSerializer.Deserialize<List<NewsSeedModel>>(json, JsonOptions) ?? [];

        foreach (var item in items)
        {
            context.News.Add(new NewsEntity
            {
                Title = item.Title,
                Date = DateTime.TryParse(item.Date, out var parsed) ? parsed : DateTime.UtcNow,
                Category = item.Category,
                Content = item.Content,
                Image = item.Image,
                FullContent = item.FullContent,
            });
        }

        context.SaveChanges();
        Console.WriteLine($"[DbSeeder] Seeded {items.Count} news articles.");
    }

    // ── Screenings ────────────────────────────────────────────────────────

    private static void SeedScreenings(CinemaDbContext context, string seedsPath)
    {
        var json = File.ReadAllText(Path.Combine(seedsPath, "screenings.json"));
        var items = JsonSerializer.Deserialize<List<ScreeningSeedModel>>(json, JsonOptions) ?? [];

        // Map mock movieId → actual DB film id (films were inserted in order, so index+1 = db id)
        var films = context.Films.OrderBy(f => f.Id).ToList();
        var filmIdMap = films
            .Select((f, i) => new { MockId = i + 1, DbId = f.Id })
            .ToDictionary(x => x.MockId, x => x.DbId);

        foreach (var item in items)
        {
            var dbMovieId = filmIdMap.TryGetValue(item.MovieId, out var mapped) ? mapped : item.MovieId;

            context.Screenings.Add(new ScreeningEntity
            {
                MovieId = dbMovieId,
                MovieTitle = item.MovieTitle,
                Hall = item.Hall,
                Date = DateTime.Parse(item.Date),
                Time = item.Time,
            });
        }

        context.SaveChanges();
        Console.WriteLine($"[DbSeeder] Seeded {items.Count} screenings.");
    }

    // ── Admin user ────────────────────────────────────────────────────────

    private static void SeedAdminUser(CinemaDbContext context)
    {
        if (context.Users.Any(u => u.Email == "admin@cinema.com")) return;

        context.Users.Add(new UserEntity
        {
            Name = "Admin",
            Email = "admin@cinema.com",
            Phone = "+0-000-0000",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = "admin",
            Status = "active",
            RegistrationDate = DateTime.UtcNow,
        });

        context.SaveChanges();
        Console.WriteLine("[DbSeeder] Admin user created: admin@cinema.com / Admin123!");
    }

    // ── Regular users ─────────────────────────────────────────────────────

    private static void SeedUsers(CinemaDbContext context, string seedsPath)
    {
        var json = File.ReadAllText(Path.Combine(seedsPath, "users.json"));
        var items = JsonSerializer.Deserialize<List<UserSeedModel>>(json, JsonOptions) ?? [];

        var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Cinema123!");

        foreach (var item in items)
        {
            if (context.Users.Any(u => u.Email == item.Email)) continue;

            context.Users.Add(new UserEntity
            {
                Name = item.Name,
                Email = item.Email,
                Phone = item.Phone,
                PasswordHash = defaultPasswordHash,
                Role = "user",
                Status = item.Status,
                RegistrationDate = DateTime.TryParse(item.RegistrationDate, out var date) ? date : DateTime.UtcNow,
            });
        }

        context.SaveChanges();
        Console.WriteLine($"[DbSeeder] Seeded {items.Count} users (default password: Cinema123!).");
    }

    // ── Bookings ──────────────────────────────────────────────────────────

    private static void SeedBookings(CinemaDbContext context, string seedsPath)
    {
        var json = File.ReadAllText(Path.Combine(seedsPath, "bookings.json"));
        var items = JsonSerializer.Deserialize<List<BookingSeedModel>>(json, JsonOptions) ?? [];

        var films = context.Films.OrderBy(f => f.Id).ToList();
        var filmIdMap = films
            .Select((f, i) => new { MockId = i + 1, DbId = f.Id })
            .ToDictionary(x => x.MockId, x => x.DbId);

        foreach (var item in items)
        {
            var dbMovieId = filmIdMap.TryGetValue(item.MovieId, out var mapped) ? mapped : item.MovieId;

            context.Bookings.Add(new BookingEntity
            {
                MovieId = dbMovieId,
                MovieTitle = item.MovieTitle,
                CustomerName = item.CustomerName,
                CustomerEmail = item.CustomerEmail,
                CustomerPhone = item.CustomerPhone,
                Hall = item.Hall,
                Seats = JsonSerializer.Serialize(item.Seats),
                Status = item.Status,
                BookingDate = DateTime.TryParse(item.BookingDate, out var bd) ? bd : DateTime.UtcNow,
                Showtime = item.Showtime,
                TotalPrice = item.TotalPrice,
            });
        }

        context.SaveChanges();
        Console.WriteLine($"[DbSeeder] Seeded {items.Count} bookings.");
    }

    // ── Seed models (local deserialization types) ─────────────────────────

    private record FilmSeedModel(
        string Title, string Poster, string Image, string Description,
        string Href, string Format, string[] Languages, string Status,
        bool Toptier, int? Duration, string? Genre, string? ReleaseDate,
        ScreeningPeriodSeedModel? ScreeningPeriod
    );

    private record ScreeningPeriodSeedModel(string Start, string End);

    private record HallSeedModel(
        string Name, int Capacity, string[] Features,
        [property: JsonPropertyName("seatMap")] SeatMapSeedModel SeatMap
    );

    private record SeatMapSeedModel(SeatRowSeedModel[] Rows);

    private record SeatRowSeedModel(string Row, int[] Seats);

    private record NewsSeedModel(
        string Title, string Date, string Category,
        string Content, string Image, string FullContent
    );

    private record ScreeningSeedModel(
        int MovieId, string MovieTitle, string Hall, string Date, string Time
    );

    private record UserSeedModel(
        string Name, string Email, string Phone,
        string Status, string RegistrationDate
    );

    private record BookingSeedModel(
        int MovieId, string MovieTitle, string CustomerName,
        string CustomerEmail, string CustomerPhone, string Hall,
        string[] Seats, string Status, string BookingDate,
        string Showtime, decimal TotalPrice
    );
}
