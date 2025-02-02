import ProfileCard from "../components/ProfileCard";
import ItineraryList from "../components/ItineraryList";
import SettingsPanel from "../components/SettingsPanel";
import bannerImage from "/public/national-park-banner.jpeg";
import Chatbot from "./Chatbot";
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div
        className="relative h-48 w-full bg-cover bg-center shadow-xl shadow-gray-800"
        style={{ 
          backgroundImage: "url('yosemite.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Darker overlay for better text visibility */}
        <div className="absolute inset-0"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <ProfileCard />
        <ItineraryList />
        <SettingsPanel />
      </div>
      <Chatbot></Chatbot>

    </div>
  );
}
