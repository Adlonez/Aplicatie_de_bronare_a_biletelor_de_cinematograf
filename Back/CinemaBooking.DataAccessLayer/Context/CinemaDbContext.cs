using CinemaBooking.Domain.Entities.Booking;
using CinemaBooking.Domain.Entities.Film;
using CinemaBooking.Domain.Entities.Hall;
using CinemaBooking.Domain.Entities.News;
using CinemaBooking.Domain.Entities.Screening;
using CinemaBooking.Domain.Entities.User;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CinemaBooking.DataAccessLayer.Context;

public sealed class CinemaDbContext : DbContext
{
    public DbSet<FilmEntity> Films { get; set; }
    public DbSet<ScreeningEntity> Screenings { get; set; }
    public DbSet<BookingEntity> Bookings { get; set; }
    public DbSet<UserEntity> Users { get; set; }
    public DbSet<HallEntity> Halls { get; set; }
    public DbSet<NewsEntity> News { get; set; }

    private static string GetConnectionString()
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
        
        var configuration = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{env}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        return configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var connectionString = GetConnectionString();
        optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Film
        modelBuilder.Entity<FilmEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Poster).HasMaxLength(1000);
            entity.Property(e => e.Image).HasMaxLength(1000);
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.Href).HasMaxLength(255);
            entity.Property(e => e.Format).HasMaxLength(10);
            entity.Property(e => e.Languages).HasColumnType("json");
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.Genre).HasMaxLength(255);
        });

        // Screening
        modelBuilder.Entity<ScreeningEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MovieTitle).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Hall).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Time).HasMaxLength(10);
            entity.HasOne(e => e.Film)
                .WithMany(f => f.Screenings)
                .HasForeignKey(e => e.MovieId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Booking
        modelBuilder.Entity<BookingEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MovieTitle).HasMaxLength(255);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CustomerEmail).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CustomerPhone).HasMaxLength(50);
            entity.Property(e => e.Hall).HasMaxLength(100);
            entity.Property(e => e.Seats).HasColumnType("json");
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.Showtime).HasMaxLength(50);
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(10,2)");
            entity.HasOne(e => e.Screening)
                .WithMany(s => s.Bookings)
                .HasForeignKey(e => e.ScreeningId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // User
        modelBuilder.Entity<UserEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Role).HasMaxLength(20).HasDefaultValue("user");
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("active");
        });

        // Hall
        modelBuilder.Entity<HallEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Features).HasColumnType("json");
            entity.Property(e => e.SeatMap).HasColumnType("json");
        });

        // News
        modelBuilder.Entity<NewsEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.Content).HasColumnType("text");
            entity.Property(e => e.Image).HasMaxLength(1000);
            entity.Property(e => e.FullContent).HasColumnType("text");
        });
    }
}
