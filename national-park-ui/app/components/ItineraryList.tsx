import { useNavigate } from "react-router-dom";

const itineraries = [
  { id: 1, name: "Yosemite Adventure", image: "/yosemite.jpg" },
  { id: 2, name: "Yellowstone Trek", image: "/yellowstone.webp" },
];

export default function ItineraryList() {
  const navigate = useNavigate();

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Saved Itineraries</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {itineraries.map((itinerary) => (
          <div
            key={itinerary.id}
            onClick={() => navigate(`/itinerary-home/${itinerary.id}`)}
            className="cursor-pointer relative rounded-lg shadow-lg overflow-hidden h-40 bg-cover bg-center group"
            style={{ backgroundImage: `url('${itinerary.image}')` }} // ✅ Forcing Tailwind to apply dynamic bg
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition"></div>

            {/* Title */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg font-semibold drop-shadow-lg">
                {itinerary.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
