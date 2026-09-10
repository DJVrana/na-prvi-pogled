import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("../pages/Home.tsx"),
  route("prijava", "../pages/FormPage.tsx"),
  route("admin", "../pages/AdminDashboard.tsx"),
  route("profil", "../pages/ProfilePage.tsx"),
  route("matching", "../pages/MatchingPage.tsx")
] satisfies RouteConfig;
