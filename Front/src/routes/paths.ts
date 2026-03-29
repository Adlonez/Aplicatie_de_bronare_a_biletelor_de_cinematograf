// src/router/paths.ts

export const paths = {
  home: "/",
  news: "news",
  films: "films",
  filmDetail: "films/:id",
  bookTicket: "films/:id/book",

  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },

  admin: {
    root: "/admin",
    dashboard: "dashboard",
    movies: "movies",
    screenings: "screenings",
    users: "users",
    bookings: "bookings",
  },

  errors: {
    notFound: "/not-found",
    unauthorized: "/unauthorized",
    forbidden: "/forbidden",
    serverError: "/server-error",
  },

  notFound: "*",
}