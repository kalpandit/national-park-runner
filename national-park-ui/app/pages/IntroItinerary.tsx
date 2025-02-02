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
    const handleViewItinerary = async (itineraryTitle: string) => {
        const email = "jprasad1231@gmail.com"; // Replace this with the actual user email
        const cost = 4; // Default cost (you can change this dynamically)
        const difficulty = "Medium"; // Default difficulty

        if (itineraryTitle == "Yellowstone National Park") {
            itineraryTitle = "Yellowstone";
        }
    
        // Construct the query parameters
        const queryParams = new URLSearchParams({
            email,
            cost: cost.toString(), // Ensure cost is a string
            difficulty,
            location: itineraryTitle, // Pass itineraryTitle as the location
        });
    
        try {
            const response = await fetch(`http://127.0.0.1:6464/create-itinerary?${queryParams.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (!response.ok) {
                throw new Error("Failed to fetch itinerary");
            }
    
            const data = await response.json();
            console.log("Itinerary Response:", data);
            alert(`Itinerary created successfully for ${itineraryTitle}!`);
        } catch (error) {
            console.error("Error fetching itinerary:", error);
            alert("Failed to fetch itinerary. Please try again later.");
        }
    };

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
                <button
                  onClick={() => handleViewItinerary(itinerary.title)}
                  className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >View Itinerary</button>
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