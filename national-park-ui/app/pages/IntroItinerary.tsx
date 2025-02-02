import React from "react";

const itineraries = [
  {
    id: 1,
    title: "Yosemite National Park",
    description:
      "Explore the breathtaking views of Yosemite Valley, Glacier Point, and Half Dome.",
    image: "dark_yosemite.jpg",
    link: "#",
  },
  {
    id: 2,
    title: "Yellowstone National Park",
    description:
      "Discover geysers, hot springs, and diverse wildlife in America’s first national park.",
    image: "yellowstone.webp",
    link: "#",
  },
];

const IntroItinerary: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <div className="relative h-[28vh] flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-green-500 text-center text-white px-6">
        <h1 className="text-4xl md:text-6xl font-bold">Let's Explore the Outdoors!</h1>
        <p className="mt-3 text-lg md:text-xl">
          Discover expert-crafted itineraries & AI-powered travel assistance
        </p>
        <a
          href="#copilot"
          className="mt-5 bg-white text-green-600 px-6 py-3 rounded-md font-semibold text-lg hover:bg-gray-100 transition"
        >
          Try AI Copilot Now
        </a>
      </div>

      {/* Itineraries Section */}
      <div className="py-9 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-6">Expert Itineraries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {itineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-[102%] hover:shadow-xl"
            >
              <img src={itinerary.image} alt={itinerary.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-semibold">{itinerary.title}</h3>
                <p className="text-gray-600 mt-2">{itinerary.description}</p>
                <a
                  href={itinerary.link}
                  className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  View Itinerary
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Copilot Section */}
      <div id="copilot" className="bg-gradient-to-r from-green-500 to-blue-500 py-10 px-6 text-center text-white">
        <h2 className="text-4xl font-bold">Meet Your AI Copilot</h2>
        <p className="text-md mt-3 max-w-2xl mx-auto">
          Need a custom itinerary? Let AI tailor your perfect trip!
        </p>
        <div className="mt-6 flex justify-center">
          <button className="bg-white text-green-600 px-6 py-3 rounded-md font-semibold text-lg hover:bg-gray-100 transition">
            Start Planning with AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroItinerary;