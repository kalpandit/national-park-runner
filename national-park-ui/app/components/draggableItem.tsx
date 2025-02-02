import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  name: string;
  difficulty: string;
  park: string;
  rating: number;
  length: string;
  time_of_day: string;
  type: string;
}

export default function SortableItem({
  id,
  name,
  difficulty,
  park,
  length,
  time_of_day,
  type
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab bg-white border border-gray-300 shadow-sm rounded-lg w-full p-3 transition-all hover:shadow-md"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium text-gray-800">{name}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded ${getDifficultyClass(difficulty)}`}>
          {difficulty}
        </span>
      </div>

      <p className="text-gray-600 text-sm mt-1">{type} {park}</p>

      <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
        <span>⏳ {length} hrs</span>
        <span>🌅 {time_of_day}</span>
      </div>
    </div>
  );
}

// Function to get color based on difficulty level
const getDifficultyClass = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-700";
    case "Hard":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};