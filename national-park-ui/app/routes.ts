import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"), // Default index route (home)
  route("itinerary-home", "pages/itinerary_home.tsx"), // Itinerary Home route
  route("profile", "pages/ProfilePage.tsx"), // ✅ Added Profile Page
] satisfies RouteConfig;
