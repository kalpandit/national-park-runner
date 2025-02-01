import React, { useState } from "react";

const images = [
  { src: "https://picsum.photos/1920/1080?random=1", text: "Welcome to National Park Runner!", description: "Let's take a look through the national parks.", color: "green-900" },
  { src: "https://picsum.photos/1920/1080?random=2", text: "Checkpoint 1: Keep going!", description: "You're making great progress!", color: "red-800" },
  { src: "https://picsum.photos/1920/1080?random=3", text: "Checkpoint 2: Halfway there!", description: "You're halfway to the finish line!", color: "orange-600" },
  { src: "https://picsum.photos/1920/1080?random=4", text: "Checkpoint 3: Almost done!", description: "Just one more push to the end!", color: "orange-500" },
  { src: "https://picsum.photos/1920/1080?random=5", text: "Checkpoint 4: You made it!", description: "Congratulations, you finished!", color: "green-800" },
];

const RunningSlider: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false); // Only start when button is clicked
  const [isPaused, setIsPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ text: string; description: string } | null>(null);

  const startJourney = () => {
    setIsRunning(true); // Start animation when clicked
    setIsPaused(false);
  };

  const openModal = (text: string, description: string) => {
    setModalContent({ text, description });
    setIsPaused(true); // Pause animation
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsPaused(false); // Resume animation
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Hidden Tailwind Classes to Ensure Inclusion */}
      <div className="hidden bg-green-900 bg-red-800 bg-orange-500 bg-orange-600 text-green-900 text-red-800 text-orange-500 text-orange-600"></div>

      {/* Image & Animation Container */}
      <div
        className="flex"
        style={{
          width: `${images.length * 100}vw`,
          animation: isRunning ? "running-slider 50s linear forwards" : "none", // Start only on button click
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-screen h-screen flex-shrink-0 relative">
            <img src={image.src} className="w-full h-full object-cover" alt={`Scene ${index + 1}`} />

            {/* Sliding Beacon Panel */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-[bounce_8s_ease-in-out_infinite]">
              <div className={`p-6 rounded-lg shadow-lg text-center ${image.color ? `bg-${image.color}` : "bg-gray-900"}`}>
                <h2 className="text-3xl text-white">{image.text}</h2>
                <p className="text-lg pt-3 text-white">{image.description}</p>

                {/* Show Start button only on the first slide and when animation hasn’t started */}
                {index === 0 && !isRunning && (
                  <button
                    onClick={startJourney}
                    className={`mt-4 px-6 py-3 bg-white text-${image.color} text-lg font-semibold rounded hover:bg-gray-200 transition`}
                  >
                    Start Journey
                  </button>
                )}

                {/* Show checkpoint buttons (excluding first slide) */}
                {index !== 0 && (
                  <button
                    onClick={() => openModal(image.text, image.description)}
                    className="mt-4 px-6 py-3 bg-white text-black text-lg font-semibold rounded hover:bg-gray-300 transition"
                  >
                    View Checkpoint
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && modalContent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-1/2">
            <h2 className="text-2xl font-bold mb-3">{modalContent.text}</h2>
            <p className="mb-4">{modalContent.description}</p>
            <button
              onClick={closeModal}
              className="mt-4 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunningSlider;