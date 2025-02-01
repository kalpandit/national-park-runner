import React, { useState } from "react";

const ItineraryHome = () => {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState(null); // Track selected activity

  const itineraryData = [
    {
      day: "Day 1",
      activities: [
        { time: "7:00 AM", duration: 1, title: "Visit Senso-ji Temple" },
        { time: "9:30 AM", duration: 1.5, title: "Explore Nakamise Shopping Street" },
        { time: "11:30 AM", duration: 2, title: "Shibuya Crossing Experience" },
        { time: "2:00 PM", duration: 1, title: "Lunch at Local Cafe" },
        { time: "3:30 PM", duration: 2.5, title: "Shopping and Dining in Shibuya" },
        { time: "8:00 PM", duration: 1.5, title: "Evening Stroll in Shinjuku" },
      ],
    },
    {
      day: "Day 2",
      activities: [
        { time: "6:00 AM", duration: 2, title: "Morning Jog at the Park" },
        { time: "9:00 AM", duration: 2, title: "Explore Ginza District" },
        { time: "12:00 PM", duration: 2, title: "Visit Odaiba Entertainment" },
        { time: "3:00 PM", duration: 1.5, title: "Relax by Tokyo Bay" },
        { time: "5:00 PM", duration: 2, title: "Nightlife in Shinjuku" },
        { time: "10:00 PM", duration: 1, title: "Late Night Snacks" },
      ],
    },
  ];

  const handlePrevious = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentDayIndex < itineraryData.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const currentDay = itineraryData[currentDayIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      {/* Top Navigation */}
      <div className="flex justify-center items-center bg-white shadow-md p-4">
        <button
          className={`text-xl font-bold ${currentDayIndex === 0 ? "text-gray-400" : "text-purple-600"}`}
          onClick={handlePrevious}
          disabled={currentDayIndex === 0}
        >
          &lt;
        </button>
        <h1 className="mx-8 text-2xl font-bold text-purple-600">{currentDay.day}</h1>
        <button
          className={`text-xl font-bold ${currentDayIndex === itineraryData.length - 1 ? "text-gray-400" : "text-purple-600"}`}
          onClick={handleNext}
          disabled={currentDayIndex === itineraryData.length - 1}
        >
          &gt;
        </button>
      </div>

      {/* Calendar View */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex w-full overflow-y-scroll">
          {/* Time Column */}
          <div className="w-1/12 bg-gray-100 text-right p-2 text-gray-500">
            <div className="relative">
              {[...Array(24).keys()].map((hour) => (
                <div key={hour} className="h-12">
                  {hour === 0
                    ? "12:00 AM"
                    : hour > 12
                    ? `${hour - 12}:00 PM`
                    : `${hour}:00 ${hour < 12 ? "AM" : "PM"}`}
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="flex-1 relative">
            <div className="h-[1200px] relative">
              {currentDay.activities.map((activity, index) => {
                // Extract time and AM/PM
                const [timeString, meridian] = activity.time.split(" ");
                const [hourRaw, minuteRaw] = timeString.split(":").map(Number);

                let hour = hourRaw;
                const minute = minuteRaw || 0;

                if (meridian === "PM" && hour !== 12) hour += 12;
                if (meridian === "AM" && hour === 12) hour = 0;

                if (hour < 6) hour += 24;

                const adjustedStartTime = hour + minute / 60;

                const top = adjustedStartTime * 48;
                const height = activity.duration * 48;

                const isSmallBlock = height < 48; // Less than 1 hour

                return (
                  <button
                    key={index}
                    className="absolute left-2 right-2 bg-purple-500 text-white rounded-lg p-2 shadow-md hover:bg-purple-600 text-sm"
                    style={{ top: `${top}px`, height: `${height}px` }}
                    onClick={() => setSelectedActivity(activity)} // Open sidebar on click
                  >
                    {isSmallBlock ? (
                      <div className="flex justify-between text-xs">
                        <span>{activity.time}</span>
                        <span>{activity.title}</span>
                      </div>
                    ) : (
                      <>
                        <div className="font-bold">{activity.time}</div>
                        <div>{activity.title}</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar for activity details */}
      {selectedActivity && (
        <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg p-4 transition-transform transform translate-x-0">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
            onClick={() => setSelectedActivity(null)} // Close sidebar
          >
            ✖
          </button>
          <h2 className="text-xl font-bold text-purple-600">{selectedActivity.title}</h2>
          <p className="text-gray-600">{selectedActivity.time}</p>
          <p className="mt-4 text-sm text-gray-700">
            Additional details can go here. Expand this section later.
          </p>
        </div>
      )}
    </div>
  );
};

export default ItineraryHome;
