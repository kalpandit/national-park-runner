import React, { useState, useEffect } from "react";

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


const RunningSlider: React.FC = () => {
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

  // Start journey and set runner to moving gif
  const startJourney = () => {
    setIsRunning(true);
    setIsPaused(false);
    setRunnerImage("runner.gif");
  };

  // Open modal (pauses journey)
  const openModal = (src: string, text: string, description: string, modalDescription: string) => {
    setModalContent({ src, text, description, modalDescription });
    setIsPaused(true);
    setModalOpen(true);
  };

  // Close modal (resumes journey)
  const closeModal = () => {
    setModalOpen(false);
    setIsPaused(false);
  };



  // Detect when the journey ends and reset runner image
  useEffect(() => {
    if (isRunning && !isPaused) {
      const journeyTime = 50 * 1000; // Matches animation duration
      const timer = setTimeout(() => {
        setRunnerImage("runner_static.png"); // Set back to static after journey ends
        setIsRunning(false);
      }, journeyTime);

      return () => clearTimeout(timer);
    }
  }, [isRunning, isPaused]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex z-10">
    {/* hack: hard-load color classes */}
    <div className='hidden bg-red-800 bg-green-900 bg-green-800 bg-orange-600 bg-green 800'></div>

      {/* Walking Path Background - Creates an infinite loop effect */}
      <div
        className="absolute bottom-0 w-full flex z-10"
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div
          className="flex"
          style={{
            width: "200%", // Make it twice as wide so it can loop
            animation: isRunning ? "scrollPath 30s linear infinite" : "none",
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          <img src="walk_path.png" className="w-full z-10" alt="Walking Path" />
          <img src="walk_path.png" className="w-full" alt="Walking Path Duplicate" />
          <img src="walk_path.png" className="w-full" alt="Walking Path Duplicate" />
          <img src="walk_path.png" className="w-full" alt="Walking Path Duplicate" />
          <img src="walk_path.png" className="w-full" alt="Walking Path Duplicate" />

        </div>
      </div>

      {/* Runner Image */}
      <div className="absolute bottom-12 left-16 z-10">
        <img src={runnerImage} alt="Runner" className="w-32 h-32 object-contain" />
      </div>

      {/* Image & Animation Container */}
      <div
        className="flex relative"
        style={{
          width: `${images.length * 100}vw`,
          animation: isRunning ? "running-slider 50s linear forwards" : "none",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-screen h-screen flex-shrink-0 relative">
            <img src={image.src} className="w-full h-full object-cover z-0" alt={`Scene ${index + 1}`} />

            {/* Sliding Beacon Panel */}
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 animate-[bounce_15s_ease-in-out_infinite]">
              <div className={`p-6 rounded-lg shadow-lg text-center ${image.color ? `bg-${image.color}` : "bg-gray-900"}`}>
                <h2 className="text-2xl text-white">{image.text}</h2>
                <p className="text-md pt-3 text-white">{image.description}</p>

                {index === 0 && !isRunning && (
                  <button onClick={startJourney} className={`mt-4 px-6 py-3 bg-white text-${image.color} text-lg font-semibold rounded hover:bg-gray-200 transition`}>
                    Start Journey
                  </button>
                )}

                {index !== 0 && (
                  <button onClick={() => openModal(image.src, image.text, image.description, image.modalDescription)} className="mt-4 px-6 py-3 bg-white text-black text-lg font-semibold rounded hover:bg-gray-300 transition">
                    View More
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {/* Modal */}
{modalOpen && modalContent && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white w-3/4 rounded-lg shadow-lg flex flex-col">
      {/* Image Section */}
      <div className="bg-gray-800 flex justify-center items-center">
        <img src={modalContent.src} alt="Modal Image" className="w-full h-64 object-cover rounded-t-lg" />
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-3">{modalContent.text}</h2>
        <p className="text-gray-700 text-lg mb-2">{modalContent.description}</p>
        <p className="whitespace-pre-wrap text-gray-600">{modalContent.modalDescription}</p>
      </div>

      {/* Fixed Action Buttons */}
      <div className="bg-gray-800 p-4 flex justify-between border-t">
        <button
          onClick={() => {
            console.log("Creating itinerary for:", modalContent.text); // Passes field from modalContent
            closeModal();
          }}
          className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded hover:bg-green-700 transition"
        >
          Create Itinerary
        </button>

        <button
          onClick={closeModal}
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default RunningSlider;