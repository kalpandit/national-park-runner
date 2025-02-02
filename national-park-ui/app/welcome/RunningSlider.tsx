import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Chatbot from "~/pages/Chatbot";



const RunningSlider: React.FC = () => {

  const images = [
    {
      src: "yosemite.jpg",
      text: "Welcome to National Park Runner!",
      description: `Welcome to the outdoors! We'll walk through the history of national parks, some key principles + things to know, and go through a few national parks! You'll have the chance to make your own itinerary, too.`,
      modalDescription: `National parks are preserved for their natural beauty and ecological importance. 
  They provide habitats for diverse species and offer visitors a chance to explore nature.
  \nFun Fact: Yosemite was one of the first national parks, designated in 1890!`,
      color: "green-900",
    },
    {
      src: "yosemite_sign.jpg",
      text: "The National Park Service",
      description: "The National Park Service protects and maintains some of the most incredible landscapes in the USA.",
      modalDescription: `The National Park Service (NPS) was established in 1916 to oversee and protect the nation's national parks and monuments.
  \nToday, it manages over 400 sites, including historic landmarks, scenic trails, and natural wonders.`,
      color: "orange-600",
    },
    {
      src: "yosemite3.avif",
      text: "Visiting a National Park",
      description: "Important principles to follow when exploring national parks.",
      modalDescription: `When visiting a national park, it's essential to follow Leave No Trace principles:
  1. Plan ahead and prepare
  2. Travel and camp on durable surfaces
  3. Dispose of waste properly
  4. Leave what you find
  5. Minimize campfire impact
  6. Respect wildlife
  7. Be considerate of others
  \nThese principles help protect the parks for future generations!`,
      color: "green-900",
    },
    {
      src: "yosemite_sign.jpg",
      text: "Explore Yosemite National Park",
      description: "A stunning park filled with waterfalls, giant sequoias, and granite cliffs.",
      modalDescription: `Yosemite National Park is known for its breathtaking landscapes, including El Capitan, Half Dome, and Yosemite Falls.
  \nFun Fact: The park is home to some of the tallest waterfalls in North America!`,
      color: "green-800",
    },
    {
      src: "yellowstone.webp",
      text: "Discover Yellowstone National Park",
      description: "America's first national park, home to geysers and diverse wildlife.",
      modalDescription: `Yellowstone National Park spans three states and features unique geothermal activity, including the famous Old Faithful geyser.
  \nFun Fact: Yellowstone has the largest concentration of geysers in the world!`,
      color: "red-800",
    },
    {
      src: "yosemite4.jpg",
      text: "Ready to Create an Itinerary?",
      description: "Plan your next national park adventure!",
      modalDescription: `Now that you've learned about national parks, it's time to plan your trip!
  \nConsider what activities interest you—hiking, wildlife watching, camping—and choose the park that fits your adventure style.`,
      color: "orange-700",
    },
  ];
  const navigate = useNavigate(); // Initialize useNavigate
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    src: string,
    text: string;
    description: string;
    modalDescription: string;
  } | null>(null);
  const [runnerImage, setRunnerImage] = useState("runner_static.png");

  const startJourney = () => {
    setIsRunning(true);
    setIsPaused(false);
    setRunnerImage("runner.gif");
  };

  // Navigate to /intro when "Explore Itineraries" is clicked
  const handleExploreItineraries = () => {
    navigate("/intro"); 
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex z-10">
      {images.map((image, index) => (
        <div key={index} className="w-screen h-screen flex-shrink-0 relative">
          <img src={image.src} className="w-full h-full object-cover z-0" alt={`Scene ${index + 1}`} />
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 animate-[bounce_15s_ease-in-out_infinite]">
            <div className={`p-6 rounded-lg shadow-lg text-center bg-gray-900/75`}>
              <h2 className="text-2xl text-white">{image.text}</h2>
              <p className="text-md pt-3 text-white">{image.description}</p>

              {/* Button for first slide */}
              {index === 0 && (
                <button
                  onClick={handleExploreItineraries}
                  className="mt-4 px-6 py-3 bg-white text-black text-lg font-semibold rounded hover:bg-gray-300 transition"
                >
                  Explore Itineraries
                </button>
              )}

              {/* Button for last slide */}
              {index === images.length - 1 && (
                <button
                  onClick={handleExploreItineraries}
                  className="mt-4 px-6 py-3 bg-white text-black text-lg font-semibold rounded hover:bg-gray-300 transition"
                >
                  Explore Itineraries
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      <Chatbot />
    </div>
  );
};

export default RunningSlider;