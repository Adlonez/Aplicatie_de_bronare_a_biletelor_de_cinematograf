# CHANGES — What you need to do after pulling this branch

## Node.js version

Vite 7 requires **Node.js 20.19+ or 22+**. If `npm run dev` crashes with a crypto error, upgrade:

**1. Install nvm** (if you don't have it):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```
Then **close and reopen your terminal** (or run `source ~/.zshrc`).

**2. Install and use Node 22:**
```bash
nvm install 22
nvm use 22
```

---

## Frontend — run once after pulling

```bash
cd Front
npm install
```

This installs the new `axios` dependency added to `package.json`.

---

## Backend — run once after pulling

If you haven't run migrations yet on your machine:

```bash
# from Back/
docker compose -f CinemaBooking.Api/compose.yml up -d
dotnet ef database update --project CinemaBooking.DataAccessLayer --startup-project CinemaBooking.Api
dotnet run --project CinemaBooking.Api
```

The database is **auto-seeded on first run** — no manual data entry needed.
Seed credentials:
- Admin: `admin@cinema.com` / `Admin123!`
- Regular users: password is `Cinema123!`

If you already have the DB running and just pulled new code, a plain `dotnet run --project CinemaBooking.Api` is enough.