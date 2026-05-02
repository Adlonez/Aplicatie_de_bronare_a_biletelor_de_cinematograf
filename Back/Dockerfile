FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["Back/CinemaBooking.sln", "Back/"]
COPY ["Back/CinemaBooking.Api/CinemaBooking.Api.csproj", "Back/CinemaBooking.Api/"]
COPY ["Back/CinemaBooking.BusinessLayer/CinemaBooking.BusinessLayer.csproj", "Back/CinemaBooking.BusinessLayer/"]
COPY ["Back/CinemaBooking.DataAccessLayer/CinemaBooking.DataAccessLayer.csproj", "Back/CinemaBooking.DataAccessLayer/"]
COPY ["Back/CinemaBooking.Domain/CinemaBooking.Domain.csproj", "Back/CinemaBooking.Domain/"]

RUN dotnet restore "Back/CinemaBooking.Api/CinemaBooking.Api.csproj"

# Copy full source and build
COPY . .
WORKDIR /src/Back/CinemaBooking.Api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# The DbSeeder looks for Front/src/_mock relative to CWD (/app/../../Front/src/_mock => /Front/src/_mock)
COPY ["Front/src/_mock", "/Front/src/_mock"]

# Expose port (default in container is usually 8080 for .NET 8)
EXPOSE 8080

ENTRYPOINT ["dotnet", "CinemaBooking.Api.dll"]