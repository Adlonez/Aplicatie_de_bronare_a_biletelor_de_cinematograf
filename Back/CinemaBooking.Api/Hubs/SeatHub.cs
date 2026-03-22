using Microsoft.AspNetCore.SignalR;

namespace CinemaBooking.Api.Hubs;

public class SeatHub : Hub
{
    // In-memory storage for temporarily locked seats
    // Key: "screeningId:row:seatNumber", Value: connectionId
    private static readonly Dictionary<string, string> LockedSeats = new();

    public async Task JoinScreening(int screeningId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"screening-{screeningId}");

        // Send currently locked seats to the new user
        var lockedForScreening = LockedSeats
            .Where(kv => kv.Key.StartsWith($"{screeningId}:"))
            .Select(kv => kv.Key)
            .ToList();

        await Clients.Caller.SendAsync("CurrentLockedSeats", lockedForScreening);
    }

    public async Task LeaveScreening(int screeningId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"screening-{screeningId}");

        // Release all seats locked by this connection for this screening
        var seatsToRelease = LockedSeats
            .Where(kv => kv.Key.StartsWith($"{screeningId}:") && kv.Value == Context.ConnectionId)
            .Select(kv => kv.Key)
            .ToList();

        foreach (var seat in seatsToRelease)
        {
            LockedSeats.Remove(seat);
        }

        if (seatsToRelease.Count > 0)
        {
            await Clients.Group($"screening-{screeningId}").SendAsync("SeatsReleased", seatsToRelease);
        }
    }

    public async Task LockSeat(int screeningId, string row, int seatNumber)
    {
        var seatKey = $"{screeningId}:{row}:{seatNumber}";

        if (LockedSeats.ContainsKey(seatKey))
        {
            await Clients.Caller.SendAsync("SeatLockFailed", seatKey, "Seat is already locked by another user");
            return;
        }

        LockedSeats[seatKey] = Context.ConnectionId;
        await Clients.Group($"screening-{screeningId}").SendAsync("SeatLocked", seatKey);
    }

    public async Task ReleaseSeat(int screeningId, string row, int seatNumber)
    {
        var seatKey = $"{screeningId}:{row}:{seatNumber}";

        if (LockedSeats.TryGetValue(seatKey, out var connectionId) && connectionId == Context.ConnectionId)
        {
            LockedSeats.Remove(seatKey);
            await Clients.Group($"screening-{screeningId}").SendAsync("SeatReleased", seatKey);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Release all seats locked by the disconnected user
        var seatsToRelease = LockedSeats
            .Where(kv => kv.Value == Context.ConnectionId)
            .Select(kv => kv.Key)
            .ToList();

        foreach (var seat in seatsToRelease)
        {
            LockedSeats.Remove(seat);
            var screeningId = seat.Split(':')[0];
            await Clients.Group($"screening-{screeningId}").SendAsync("SeatReleased", seat);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
