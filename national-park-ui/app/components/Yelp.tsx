import React from "react";
import { StarIcon, MapPinIcon } from "@heroicons/react/24/solid";

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
  results: YelpResult[];
}

const Yelp: React.FC<YelpProps> = ({ results }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">
        🍽️ Top Restaurants Near You
      </h1>

      {results.length === 0 ? (
        <p className="text-center text-gray-500">No results found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((restaurant, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-5 transition transform hover:scale-105 hover:shadow-lg"
            >
              {/* Restaurant Name */}
              <h2 className="text-2xl font-semibold text-gray-900">
                {restaurant.name}
              </h2>

              {/* Location */}
              <p className="text-gray-500 flex items-center mt-1">
                <MapPinIcon className="h-5 w-5 text-red-500 mr-2" />
                {restaurant.city}
              </p>

              {/* Food Type & Cost */}
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Type:</span> {restaurant.food_type}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Cost:</span> {restaurant.cost}
              </p>

              {/* Rating */}
              <div className="flex items-center mt-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(restaurant.rating) ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-700">{restaurant.rating} / 5</span>
              </div>

              {/* Google Maps Link */}
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
    </div>
  );
};

export default Yelp;
