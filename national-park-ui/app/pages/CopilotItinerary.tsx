import React, { useEffect, useState } from "react";
import axios from "axios";
import { DndContext, closestCorners, type DragEndEvent } from "@dnd-kit/core";
import { useUser } from "@clerk/clerk-react";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import Chatbot from "./Chatbot";
import { useLocation } from "react-router-dom";
import Yelp from "~/components/Yelp";

const API_URL = "http://127.0.0.1:6464";

type Activity = {
  accessible: boolean;
  difficulty: string;
  description: string;
  name:string;
  rating: number;
  time: number;
  type: string;
  time_of_day: string;
};

type Day = {
  activities: Activity[];
};

type ItineraryData = {
  days: Day[];
  description: string;
  image: { image_url: string };
  name: string;
};


interface SortableItemProps {
  activity: Activity;
  dayIndex: number;
  activityIndex: number;
  fetchAlternatives: (
    activityName: string,
    dayIdx: number,
    actIdx: number
  ) => Promise<void>;
  alternatives: Activity[] | undefined;
  loadingAlternatives: boolean;
  setItinerary: React.Dispatch<React.SetStateAction<ItineraryData | null>>;
  showAlternatives: boolean; // ✅ Add this
  toggleShowAlternatives: (dayIndex: number, activityIndex: number) => void; // ✅ Add this
}
const SortableItem: React.FC<SortableItemProps> = ({
  activity,
  dayIndex,
  activityIndex,
  fetchAlternatives,
  alternatives,
  loadingAlternatives,
  setItinerary,
  showAlternatives,
  toggleShowAlternatives,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${dayIndex}-${activityIndex}`, 
    data: {
      type: "activity",
      dayIndex,
      activityIndex,
    },
    animateLayoutChanges: () => false,
    disabled: showAlternatives, // ✅ Disable dragging if alternatives are expanded
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  const acceptAlternative = (alternative: Activity) => {
    setItinerary((prevItinerary) => {
      if (!prevItinerary) return prevItinerary;
      const newItinerary = { ...prevItinerary };
      newItinerary.days[dayIndex].activities[activityIndex] = alternative;
      return newItinerary;
    });

    toggleShowAlternatives(dayIndex, activityIndex); // Hide alternatives after selection
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-6 rounded-lg shadow-lg">
      <div
        {...attributes}
        {...(showAlternatives ? {} : listeners)} // ✅ Disable dragging if alternatives are expanded
        className={`cursor-grab bg-gray-200 rounded p-2 inline-block mb-2 ${
          showAlternatives ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span className="text-gray-600">{showAlternatives ? "Pick an alternative or hide alternatives before dragging" : ":: drag ::"}</span>
      </div>

      <h3 className="text-xl font-semibold">{activity.name}</h3>
      <p className="text-gray-600">{activity.description}</p>

      <div className="flex items-center mt-2 text-gray-600">
        <span className="capitalize">{activity.type} {activity.difficulty && `- ${activity.difficulty}`}</span>
        <span className="ml-3 flex items-center">
          <ClockIcon className="h-5 w-5 mr-1 text-gray-500" />
          Suggested: {activity.time_of_day} {activity.time && `- ${activity.time} hrs`}
        </span>
        {activity.accessible ? (
          <span className="ml-3 flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            Accessible
          </span>
        ) : (
          <span className="ml-3 flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            Not Accessible
          </span>
        )}
      </div>

      <div className="mt-3">
        <button
          className="text-sm bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={() => toggleShowAlternatives(dayIndex, activityIndex)}
        >
          {loadingAlternatives ? "Loading..." : showAlternatives ? "Hide Alternatives" : "Propose Alternatives"}
        </button>
      </div>

      {showAlternatives && alternatives && alternatives.length > 0 && (
        <div className="mt-2 p-2 border border-gray-200 rounded">
          <h4 className="font-bold">Alternatives:</h4>
          <ul className="list-disc ml-4">
            {alternatives.map((alt, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-gray-50">
                <h1 className="text-lg">{alt.name}</h1>
                <p className="text-md">{alt.description}</p>
                <div className="flex items-center mt-2 text-gray-600">
                  <span className="capitalize">
                    {alt.type} {alt.difficulty && `- ${alt.difficulty}`}
                  </span>
                  <span className="ml-3 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-1 text-gray-500" />
                    Suggested: {alt.time_of_day} {alt.time && `- ${alt.time} hrs`}
                  </span>
                  {alt.accessible ? (
                    <span className="ml-3 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      Accessible
                    </span>
                  ) : (
                    <span className="ml-3 flex items-center">
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                      Not Accessible
                    </span>
                  )}
                </div>
                <button
                  className="text-sm bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-2"
                  onClick={() => acceptAlternative(alt)}
                >
                  Accept Activity
                </button>
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


const CopilotItinerary = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showItinerary, setShowItinerary] = useState(false);
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress

  const location = useLocation();
  const initialData = location.state?.initialData || null; // ✅ Extract state safely

  const [data, setData] = useState(initialData);

  const [alternatives, setAlternatives] = useState<{
    [key: string]: Activity[];
  }>({});
  const [loadingAlternatives, setLoadingAlternatives] = useState<{
    [key: string]: boolean;
  }>({});

  const [showAlternatives, setShowAlternatives] = useState<{
    [key: string]: boolean;
  }>({});
  
  // Toggle function to set visibility per activity
  const toggleShowAlternatives = (dayIndex: number, activityIndex: number) => {
    const activityKey = `${dayIndex}-${activityIndex}`;
    setShowAlternatives((prev) => ({
      ...prev,
      [activityKey]: !prev[activityKey],
    }));
  
    // Fetch alternatives only if opening the menu
    if (!showAlternatives[activityKey]) {
      fetchAlternatives(itinerary!.days[dayIndex].activities[activityIndex].name, dayIndex, activityIndex);
    }
  };
  

  // Fetch alternative activities for an activity
  const fetchAlternatives = async (
    activityName: string,
    dayIndex: number,
    activityIndex: number
  ) => {
    const activityKey = `${dayIndex}-${activityIndex}`;
  
    // Prevent refetching if alternatives already exist
    if (alternatives[activityKey]) return;
  
    setLoadingAlternatives((prev) => ({ ...prev, [activityKey]: true }));
  
    let attempts = 0;
    let success = false;
    let lastError = "";
  
    while (attempts < 2 && !success) {
      try {
        const response = await axios.post(`${API_URL}/propose_change`, {
          proposed_change: activityName,
          info_request: itinerary,
        });
  
        const fetchedAlternatives = response.data.days[0].activities || [];
  
        setAlternatives((prev) => ({
          ...prev,
          [activityKey]: fetchedAlternatives,
        }));
  
        success = true;
      } catch (err) {
        console.error(`Attempt ${attempts + 1} failed:`, err);
        lastError = "Failed to fetch alternatives. Please try again.";
        attempts += 1;
      }
    }
  
    setLoadingAlternatives((prev) => ({ ...prev, [activityKey]: false }));
  
    // Show a retry button if both attempts fail
    if (!success) {
      setAlternatives((prev) => ({
        ...prev,
        [activityKey]: [],
      }));
  
      setShowAlternatives((prev) => ({
        ...prev,
        [activityKey]: false, // Ensure UI hides failed fetch result
      }));
  
      alert(lastError); // Notify the user
    }
  };

  useEffect(() => {
    if (initialData) {
      console.log("hiii")
      setItinerary(initialData);
      setShowItinerary(true);
    }
  }, [initialData]);

  // Fetch itinerary
  const fetchItinerary = async () => {
    setLoading(true);
    setError("");
    setShowItinerary(false);

    try {
      const response = await axios.post(`${API_URL}/generate_itinerary`, {
        info_request: userPrompt,
      });
      console.log("correct?");
      console.log(response.data);
      setItinerary(response.data);
      setTimeout(() => setShowItinerary(true), 500);
    } catch (err) {
      setError("Failed to fetch itinerary. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveItineraryToBackend = async () => {
    if (!itinerary) return;
  
    try {
      const response = await axios.post(`${API_URL}/save-itinerary`, {
        email: email,
        ...itinerary, 
      });
  
      console.log("Itinerary saved:", response.data);
      alert("Itinerary saved successfully!");
    } catch (err) {
      console.error("Failed to save itinerary:", err);
      alert("Failed to save itinerary. Please try again.");
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active?.id || !over?.id || !itinerary) return; // Ensure IDs exist

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (!activeId.includes("-") || !overId.includes("-")) return; // Ensure correct ID format

    const [activeDayIndex, activeActivityIndex] = activeId
      .split("-")
      .map(Number);
    const [overDayIndex, overActivityIndex] = overId.split("-").map(Number);

    if (
      isNaN(activeDayIndex) ||
      isNaN(activeActivityIndex) ||
      isNaN(overDayIndex) ||
      isNaN(overActivityIndex)
    ) {
      return;
    }

    const newItinerary = { ...itinerary };

    if (activeDayIndex === overDayIndex) {
      // Same day reorder
      newItinerary.days[activeDayIndex].activities = arrayMove(
        newItinerary.days[activeDayIndex].activities,
        activeActivityIndex,
        overActivityIndex
      );
    } else {
      // Move activity to a different day
      const [movedActivity] = newItinerary.days[
        activeDayIndex
      ].activities.splice(activeActivityIndex, 1);
      newItinerary.days[overDayIndex].activities.splice(
        overActivityIndex,
        0,
        movedActivity
      );
    }

    setItinerary(newItinerary);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!showItinerary && (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-green-200 to-blue-200">
          <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
            <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
              Copilot: Create Your Itinerary
            </h1>
            <input
              type="text"
              placeholder="Describe your ideal trip..."
              className="w-full p-4 border-2 border-gray-300 rounded-lg"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
            />
            <button
              onClick={fetchItinerary}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg mt-4 transition"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Itinerary"}
            </button>
            {error && <p className="text-red-500 text-center mt-3">{error}</p>}
          </div>
        </div>
      )}

      {showItinerary && itinerary && (
        <div className="max-w-4xl mx-auto py-3 px-6">
          <button
            onClick={() => setShowItinerary(false)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="ml-1">Back to Copilot</span>
          </button>

          <div
            className="relative bg-cover bg-center h-[400px] flex items-center justify-center text-white rounded-lg shadow-lg"
            style={{ backgroundImage: `url(${itinerary.image.image_url})` }}
          ></div>

          <div className="my-6">
            <h1 className="text-4xl font-bold">{itinerary.name}</h1>
            <p className="text-lg mt-2">{itinerary.description}</p>
          </div>

          {/* Save Itinerary Button */}
            {!initialData && (
              <button
              onClick={saveItineraryToBackend}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg -mt-16 mb-8 transition"
            >
              Save Itinerary
            </button>
            )}

          {/* DnDContext wraps the entire itinerary of days */}
          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            {itinerary.days.map((day, dayIndex) => (
              <div key={dayIndex} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Day {dayIndex + 1}
                </h2>

                <SortableContext
                  items={day.activities.map((_, i) => `${dayIndex}-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {day.activities.map((activity, activityIndex) => {
                      const activityKey = `${dayIndex}-${activityIndex}`;
                      return (
                        <SortableItem
                        key={activityKey}
                        activity={activity}
                        dayIndex={dayIndex}
                        activityIndex={activityIndex}
                        fetchAlternatives={fetchAlternatives}
                        alternatives={alternatives[activityKey]}
                        loadingAlternatives={!!loadingAlternatives[activityKey]}
                        setItinerary={setItinerary}
                        showAlternatives={!!showAlternatives[activityKey]}
                        toggleShowAlternatives={toggleShowAlternatives}
                      />

                    )})}
                  </div>
                </SortableContext>
              </div>
            ))}
          </DndContext>
          <Yelp location={itinerary.name}></Yelp>
        </div>
      )}
      <Chatbot></Chatbot>
    </div>
  );
};

export default CopilotItinerary;
