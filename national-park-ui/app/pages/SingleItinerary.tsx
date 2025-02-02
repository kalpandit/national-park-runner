import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "~/components/draggableItem";
import Yelp from "~/components/Yelp";

interface Itinerary {
    _id: string;
    name?: string;
    location?: string;
    image_url?: string;
    cost: number;
    difficulty: string;
    itinerary_objects_morning: any[];
    itinerary_objects_noon: any[];
    itinerary_objects_night: any[];
    alternative_options_morning: any[];
    alternative_options_noon: any[];
    alternative_options_night: any[];
}

export default function SingleItinerary() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);


    useEffect(() => {
        const fetchItinerary = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:6464/get-single-itinerary", {
                    params: { _id: id },
                });
                setItinerary(response.data.itinerary);
            } catch (err) {
                console.error("Error fetching itinerary:", err);
                setError("Failed to load itinerary.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchItinerary();
    }, [id]);

    // Function to handle saving itinerary
    const handleSaveItinerary = async () => {
        if (!itinerary) return;

        setSaving(true);
        try {
            await axios.post("http://127.0.0.1:6464/update-itinerary", {
                _id: id,
                updatedItinerary: itinerary,
            });
            alert("Itinerary saved successfully!");
        } catch (err) {
            console.error("Error saving itinerary:", err);
            alert("Failed to save itinerary.");
        } finally {
            setSaving(false);
        }
    };

    const handleReplaceActivity = (section: string, existingActivityId: string, newActivity: any) => {
        setItinerary((prev) => {
            if (!prev) return prev;

            const newActivities = [...prev[section]];
            const indexToReplace = newActivities.findIndex((item) => item._id === existingActivityId);

            if (indexToReplace !== -1) {
                newActivities[indexToReplace] = newActivity;
            }

            return { ...prev, [section]: newActivities };
        });
    };

    const handleDragEnd = (event: any, section: string) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setItinerary((prev) => {
            if (!prev) return prev;

            const newActivities = [...prev[section]];
            const oldIndex = newActivities.findIndex((item) => item._id === active.id);
            const newIndex = newActivities.findIndex((item) => item._id === over.id);

            return { ...prev, [section]: arrayMove(newActivities, oldIndex, newIndex) };
        });
    };

    if (loading) return <p className="text-gray-500 text-center mt-6">Loading itinerary...</p>;
    if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
    if (!itinerary) return <p className="text-gray-500 text-center mt-6">Itinerary not found.</p>;
    let imageUrl =
    itinerary.image_url ||
    (itinerary.location?.toLowerCase().includes("yellowstone") ? "yellowstone.webp" :
    itinerary.location?.toLowerCase().includes("yosemite") ? "yosemite.jpg" :
    null);
  const backgroundStyle = imageUrl ? { backgroundImage: `url('${imageUrl}')` } : { backgroundColor: "#008000" };
    return (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {itinerary.location || itinerary.name}
            </h2>

            {/* Activity Sections */}
            <ActivitySection
                title="Morning Activities"
                activities={itinerary.itinerary_objects_morning}
                alternativeActivities={itinerary.alternative_options_morning}
                sectionKey="itinerary_objects_morning"
                onDragEnd={handleDragEnd}
                onReplaceActivity={handleReplaceActivity}
            />
            <ActivitySection
                title="Afternoon Activities"
                activities={itinerary.itinerary_objects_noon}
                alternativeActivities={itinerary.alternative_options_noon}
                sectionKey="itinerary_objects_noon"
                onDragEnd={handleDragEnd}
                onReplaceActivity={handleReplaceActivity}
            />
            <ActivitySection
                title="Evening Activities"
                activities={itinerary.itinerary_objects_night}
                alternativeActivities={itinerary.alternative_options_night}
                sectionKey="itinerary_objects_night"
                onDragEnd={handleDragEnd}
                onReplaceActivity={handleReplaceActivity}
            />
            <Yelp location={itinerary.name || itinerary.location || "Yellowstone National Park"}></Yelp>
            {/* Save Button */}
            <button
                className={`mt-6 w-full px-4 py-3 ${saving ? "bg-gray-400" : "bg-green-600"} text-white rounded-lg shadow-md hover:bg-green-700 transition duration-200`}
                onClick={handleSaveItinerary}
                disabled={saving}
            >
                {saving ? "Saving..." : "Save Itinerary"}
            </button>

            {/* Back Button */}
            <button
                className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                onClick={() => navigate(-1)}
            >
                Back to Itineraries
            </button>
        </div>
    );
}

interface ActivitySectionProps {
    title: string;
    activities: any[];
    alternativeActivities: any[];
    sectionKey: string;
    onDragEnd: (event: any, section: string) => void;
    onReplaceActivity: (section: string, existingActivityId: string, newActivity: any) => void;
}

const ActivitySection: React.FC<ActivitySectionProps> = ({
    title, activities, alternativeActivities, sectionKey, onDragEnd, onReplaceActivity 
}) => {
    const [selectedActivities, setSelectedActivities] = useState<{ [key: string]: string | null }>({});

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">{title}</h3>

            {/* Draggable Activities */}
            <DndContext collisionDetection={closestCenter} onDragEnd={(event) => onDragEnd(event, sectionKey)}>
                <SortableContext items={activities.map((obj) => obj._id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div key={activity._id} className="p-4 bg-gray-100 rounded-lg shadow-sm flex items-center justify-between">
                                <SortableItem id={activity._id} name={activity.name} difficulty={activity.difficulty} length={activity.length} type={activity.type} rating={activity.rating} time_of_day={activity.time_of_day} />
                            </div>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Alternative Activities */}
            {alternativeActivities.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg my-2 font-semibold text-gray-600">Alternative Options</h4>
                    <div className="space-y-3">
                        {alternativeActivities.map((altActivity) => (
                            <div key={altActivity._id} className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
                                <span className="text-gray-600">{altActivity.name} - {altActivity.length} hours ({altActivity.difficulty})</span>

                                <div className="flex items-center space-x-2">
                                    {/* Dropdown */}
                                    <select
                                        className="px-2 py-1 border rounded-md text-sm"
                                        value={selectedActivities[altActivity._id] || ""}
                                        onChange={(e) =>
                                            setSelectedActivities((prev) => ({
                                                ...prev,
                                                [altActivity._id]: e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="" disabled>Select activity to replace</option>
                                        {activities.map((activity) => (
                                            <option key={activity._id} value={activity._id}>
                                                {activity.name} - {activity.length} hours
                                            </option>
                                        ))}
                                    </select>

                                    {/* Replace Button */}
                                    <button
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400"
                                        disabled={!selectedActivities[altActivity._id]}
                                        onClick={() => {
                                            if (selectedActivities[altActivity._id]) {
                                                onReplaceActivity(sectionKey, selectedActivities[altActivity._id]!, altActivity);
                                                setSelectedActivities((prev) => ({
                                                    ...prev,
                                                    [altActivity._id]: null,
                                                }));
                                            }
                                        }}
                                    >
                                        Replace
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};