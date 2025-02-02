import React, { useState, useEffect } from "react";
import axios from "axios";
import { StarIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { useUser } from "@clerk/clerk-react";
import { APIProvider, Marker, Map } from "@vis.gl/react-google-maps";

type YelpResult = {
  name: string;
  city: string;
  cost: string;
  food_type: string;
  latitude: number;
  longitude: number;
  rating: number;
};

interface YelpProps {
  location: string; // e.g., "Yosemite Valley"
}

const Yelp: React.FC<YelpProps> = ({ location }) => {
  const { user } = useUser();
  const [breakfastResults, setBreakfastResults] = useState<YelpResult[]>([]);
  const [lunchResults, setLunchResults] = useState<YelpResult[]>([]);
  const [dinnerResults, setDinnerResults] = useState<YelpResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    name: "",
    description: "",
    difficulty: "Moderate",
    cost: '$$',
    accessibility: "Doesn't Need Accessible",
  });
  useEffect(() => {
      if (user) {
        setPreferences({
          name: (user.unsafeMetadata as { name?: string }).name || "", // Use Clerk's first and last name
          description: (user.unsafeMetadata as { description?: string }).description || "", // Use stored metadata
          difficulty: (user.unsafeMetadata as { difficulty?: string }).difficulty || "Moderate",
          cost: (user.unsafeMetadata as { cost?: string }).cost || "$$",
          accessibility: (user.unsafeMetadata as { accessibility?: string }).accessibility || "Doesn't Need Accessible",
        });
        console.log(preferences)
      }
    }, [user]);

  useEffect(() => {
    const fetchData = async (mealType: string, setResults: React.Dispatch<React.SetStateAction<YelpResult[]>>) => {
      try {
        const response = await axios.get("http://localhost:6464/yelp", {
          params: { term: mealType, location: location, price: preferences.cost },
        });
        setResults(response.data);
      } catch (err) {
        console.error(`Error fetching ${mealType} data:`, err);
        setError(`Failed to load ${mealType} data.`);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchData("breakfast", setBreakfastResults),
        fetchData("lunch", setLunchResults),
        fetchData("dinner", setDinnerResults),
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, [location]);

  const renderResults = (title: string, results: YelpResult[]) => (
    <div className="mb-10">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY} onLoad={() => console.log("Maps API has loaded.")}>
      <h2 className="text-3xl font-semibold text-gray-900 mb-4">{title}</h2>
      {results.length === 0 ? (
        <p className="text-gray-500">No results found for {title.toLowerCase()}.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {results.map((restaurant, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-5 transition transform hover:scale-105 hover:shadow-lg"
            >
              <h2 className="text-2xl font-semibold text-gray-900">{restaurant.name}</h2>
              <p className="text-gray-500 flex items-center mt-1">
                <MapPinIcon className="h-5 w-5 text-red-500 mr-2" />
                {restaurant.city}
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Type:</span> {restaurant.food_type}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Cost:</span> {restaurant.cost}
              </p>
              <div className="flex items-center mt-3 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(restaurant.rating) ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-700 ">{restaurant.rating} / 5</span>
              </div>
  
              {/* Google Map for each restaurant */}
              <Map 
                center={{ lat: restaurant.latitude, lng: restaurant.longitude }} 
                zoom={15} 
                style={{ width: "100%", height: "200px" }}
              >
                <Marker position={{ lat: restaurant.latitude, lng: restaurant.longitude }} />
              </Map>
  
              <a
                href={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-semibold"
              >
                View on Google Maps →
              </a>
            </div>
          ))}
        </div>
      )}
      </APIProvider>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">
        🍽️ Top Restaurants Near You
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          {renderResults("Breakfast", breakfastResults)}
          {renderResults("Lunch", lunchResults)}
          {renderResults("Dinner", dinnerResults)}
        </>
      )}
    </div>
  );
};

export default Yelp;