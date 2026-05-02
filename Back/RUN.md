# CinemaBooking Backend — Run from Scratch

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| .NET SDK | 8.0+ | macOS: `brew install --cask dotnet-sdk@8` · Windows: [dot.net/download](https://dotnet.microsoft.com/download) |
| Docker Desktop | any | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| EF Core CLI | any | `dotnet tool install --global dotnet-ef` |

> **After installing `dotnet-ef`**, if the command is not found, add the tools folder to your PATH:
>
> macOS/Linux — add to `~/.zshrc` or `~/.bashrc`:
> ```bash
> export PATH="$PATH:$HOME/.dotnet/tools"
> ```
> Windows (PowerShell) — add to your profile:
> ```powershell
> $env:PATH += ";$env:USERPROFILE\.dotnet\tools"
> ```
> Then restart your terminal (or run `source ~/.zshrc` on macOS/Linux).

---

## Configuration

Local defaults live in **`CinemaBooking.Api/appsettings.json`**, but Docker and deployment can override them through environment variables.

If your MySQL credentials differ from the defaults, edit that file before running:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=cinemabooking;User=root;Password=root;"
}
```

For deployment, `docker-compose.deploy.yml` sets:
```yaml
ConnectionStrings__DefaultConnection=Server=mysql;Port=3306;Database=cinemabooking;User=root;Password=${MYSQL_ROOT_PASSWORD:-root};
```

The backend now reads environment variables as overrides, so the same code works locally and in Docker.

---

## Step 1 — Start the MySQL Database

From the `Back/` folder:

```bash
docker compose -f CinemaBooking.Api/compose.yml up -d
```

This starts a MySQL 8.0 container:
- **Host**: `localhost`
- **Port**: `3306`
- **Database**: `cinemabooking`
- **User**: `root` / **Password**: `root`

Verify it's running:
```bash
docker ps
```

---

## Step 2 — Create the Database Migration

From the `Back/` folder:

```bash
dotnet ef migrations add Initial --project CinemaBooking.DataAccessLayer --startup-project CinemaBooking.Api
```

This generates migration files in `CinemaBooking.DataAccessLayer/Migrations/`.

---

## Step 3 — Apply Migration to Database

From the `Back/` folder:

```bash
dotnet ef database update --project CinemaBooking.DataAccessLayer --startup-project CinemaBooking.Api
```

This creates all tables in MySQL (`Films`, `Screenings`, `Bookings`, `Users`, `Halls`, `News`).

---

## Step 4 — Run the API

From the `Back/` folder:

```bash
dotnet run --project CinemaBooking.Api
```

The API starts at: **http://localhost:5087**
Swagger UI: **http://localhost:5087/swagger**

On startup the API also applies pending EF migrations before seeding mock data.

If you run the frontend with Vite locally, requests to `/api` are proxied to `http://localhost:5087` by `Front/vite.config.ts`.

## Deployment Notes

For the domain deployment:
- backend uses the Docker MySQL service via `ConnectionStrings__DefaultConnection`
- frontend calls the API with same-origin `/api` requests
- Nginx proxies `/api/` to the backend container
- migrations run automatically when the backend starts

If you add a new environment, keep the API base path and DB connection override aligned with the deployment compose file.

---

## Endpoints Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health/test` | — | Health check |
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT token |
| GET | `/api/films/list` | — | All films |
| GET | `/api/films/{id}` | — | Film by ID |
| POST | `/api/films/create` | Admin | Create film |
| PUT | `/api/films/{id}` | Admin | Update film |
| DELETE | `/api/films/{id}` | Admin | Soft-delete film |
| GET | `/api/screenings/list` | — | All screenings |
| GET | `/api/screenings/movie/{movieId}` | — | Screenings for a film |
| POST | `/api/screenings/create` | Admin | Create screening |
| PUT | `/api/screenings/{id}` | Admin | Update screening |
| DELETE | `/api/screenings/{id}` | Admin | Soft-delete screening |
| GET | `/api/bookings/list` | Admin | All bookings |
| GET | `/api/bookings/user/{userId}` | User | User's bookings |
| POST | `/api/bookings/create` | — | Create booking |
| PUT | `/api/bookings/{id}/status` | Admin | Update booking status |
| DELETE | `/api/bookings/{id}` | Admin | Soft-delete booking |
| GET | `/api/users/list` | Admin | All users |
| PUT | `/api/users/{id}/status` | Admin | Update user status |
| DELETE | `/api/users/{id}` | Admin | Soft-delete user |
| GET | `/api/halls/list` | — | All halls |
| GET | `/api/halls/{id}` | — | Hall by ID |
| POST | `/api/halls/create` | Admin | Create hall |
| GET | `/api/news/list` | — | All news |
| POST | `/api/news/create` | Admin | Create news |

### SignalR Hub
- **URL**: `ws://localhost:5087/hubs/seats`
- **Events**: `JoinScreening`, `LockSeat`, `ReleaseSeat`, `LeaveScreening`

---

## Authentication

Protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is returned by `/api/auth/login` and `/api/auth/register`.

Roles:
- `user` — can view own bookings
- `admin` — full access to all endpoints

---

## Project Structure

```
Back/
├── CinemaBooking.sln
├── RUN.md                          ← you are here
├── global.json
├── CinemaBooking.Api/              ← Web API (port 5087)
│   ├── Controllers/                (Auth, Film, Screening, Booking, User, Hall, News, Health)
│   ├── Hubs/SeatHub.cs            (SignalR real-time seat locking)
│   ├── Program.cs                 (JWT, CORS, SignalR, Swagger)
│   └── compose.yml                (MySQL Docker config)
├── CinemaBooking.BusinessLayer/
│   ├── Interfaces/                (IFilmLogic, IScreeningLogic, etc.)
│   ├── Core/                      (Logic classes — implement interfaces)
│   ├── Structure/                 (Actions classes — actual DB logic)
│   └── BusinessLogic.cs          (Factory, same pattern as WebStore2)
├── CinemaBooking.DataAccessLayer/
│   ├── Context/CinemaDbContext.cs (MySQL via Pomelo EF Core)
│   └── Migrations/               (auto-generated, do not edit manually)
└── CinemaBooking.Domain/
    ├── Entities/                  (Film, Screening, Booking, User, Hall, News)
    └── Models/                    (DTOs + ServiceResponse)
```

---

## Common Issues

**`dotnet-ef` not found after install**
```bash
export PATH="$HOME/.dotnet/tools:$PATH"
# Add this line permanently to ~/.zshrc
```

**Migration already exists**
```bash
# Remove and recreate
dotnet ef migrations remove --project CinemaBooking.DataAccessLayer --startup-project CinemaBooking.Api
dotnet ef migrations add Initial --project CinemaBooking.DataAccessLayer --startup-project CinemaBooking.Api
```

**MySQL container won't start (port 3306 in use)**
```bash
# macOS/Linux — check what's using it
lsof -i :3306
# Windows
netstat -ano | findstr :3306
```
Or change the port in `CinemaBooking.Api/compose.yml` and update `appsettings.json` accordingly.

**Can't connect to MySQL**
```bash
# Check container is running
docker ps
# Check logs
docker logs cinema-mysql
```

---

## Stopping Everything

```bash
# Stop the API: Ctrl+C in the terminal running dotnet run

# Stop MySQL container
docker compose -f CinemaBooking.Api/compose.yml down

# Stop and delete all MySQL data (full reset)
docker compose -f CinemaBooking.Api/compose.yml down -v
```
