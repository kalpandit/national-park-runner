import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

interface Itinerary {
  _id: string;
  name: string;
  image_url?: string;
  location?: string;
  generative_data?: any; // ✅ Added generative-data field
}

export default function ItineraryList() {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchItineraries = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        const response = await axios.get("http://127.0.0.1:6464/get-itinerary", {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            email: user.primaryEmailAddress.emailAddress,
          },
        });

        console.log(response.data);
        if (response.data.itineraries) {
          setItineraries(response.data.itineraries as Itinerary[]);
        } else {
          setItineraries([]);
        }
      } catch (err) {
        console.error("Error fetching itineraries:", err);
        setError("Set some preferences to get started.");
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [user]);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Saved Itineraries</h2>

      {loading ? (
        <p className="text-gray-500">Loading itineraries...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : itineraries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {itineraries.map((itinerary) => {
            let imageUrl =
              itinerary.image_url ||
              (itinerary.location?.toLowerCase().includes("yellowstone")
                ? "yellowstone.webp"
                : itinerary.location?.toLowerCase().includes("yosemite")
                ? "yosemite.jpg"
                : null);

            const backgroundStyle = imageUrl
              ? { backgroundImage: `url('${imageUrl}')` }
              : { backgroundColor: "#008000" };

            return (
              <div
                key={itinerary._id}
                onClick={() =>
                  itinerary.generative_data
                    ? navigate("/copilot-itinerary", {
                        state: { initialData: itinerary.generative_data },
                      })
                    : navigate(`/single/${itinerary._id}`)
                }
                className="cursor-pointer relative rounded-lg shadow-lg overflow-hidden h-40 bg-cover bg-center group bg-black"
                style={backgroundStyle}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-l from-gray-800/60 to-gray-900/60 group-hover:bg-opacity-50 transition"></div>

                {/* Title */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold drop-shadow-lg">
                    {itinerary.location || itinerary.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No itineraries found.</p>
      )}
    </div>
  );
}