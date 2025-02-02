import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"), // Default index route (home)
  route("itinerary-home", "pages/itinerary_home.tsx"), // Itinerary Home route
  route("copilot-itinerary", "pages/CopilotItinerary.tsx"), // Itinerary Home route
  route("login/*", "routes/login.tsx"),  // Handles `/login` and `/login/...`
  route("register/*", "routes/register.tsx"),  // Handles `/register` and `/register/...`
  route("profile", "pages/ProfilePage.tsx"), // ✅ Added Profile Page
  route("chatbot", "pages/Chatbot.tsx"), // Itinerary Home route
  route("maps", "pages/Maps.tsx"), // Itinerary Home route
  route("intro", "pages/IntroItinerary.tsx"), // Itinerary Home route
] satisfies RouteConfig;
