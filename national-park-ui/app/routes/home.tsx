import type { Route } from "./+types/home";
import RunningSlider from "../welcome/RunningSlider";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import Chatbot from "~/pages/Chatbot";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="bg-green-900 text-white p-4 fixed w-full top-0 left-0 flex justify-between items-center shadow-lg z-50">
      <div className='flex flex-row space-x-2 items-center'>
      <img src="logo.png" className='w-16 h-16' />
      <div className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
        ExploreEase
      </div>
      </div>
      
      <div className="flex gap-6 items-center">
        {/* Copilot Link */}
        <button
          onClick={() => navigate("/copilot-itinerary")}
          className="px-4 py-2 bg-green-800 rounded hover:bg-green-700 transition"
        >
          Plan with AI
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
        >
          Itineraries
        </button>

        {/* Auth Section */}
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
              Login
            </button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
};

export default function Home() {

  return (
    <div className="relative w-screen h-screen overflow-hidden flex z-10">
      {/* Navbar */}
      <Navbar />
      <RunningSlider></RunningSlider>
      <div className='z-50'>
        <Chatbot />
      </div>
    </div>
  );
}
