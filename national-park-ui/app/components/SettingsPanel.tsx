import { useState, useEffect } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import axios from "axios";

export default function SettingsPanel() {
  return (
    <div>
      <SignedIn>
        <SettingsContent />
      </SignedIn>
      <SignedOut>
        <p>Please sign in to access settings.</p>
      </SignedOut>
    </div>
  );
}

function SettingsContent() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState("account");
  const [preferences, setPreferences] = useState({
    name: "",
    description: "",
    difficulty: "Moderate",
    cost: '$$',
    accessibility: "Doesn't Need Accessible",
  });
  const [showPopup, setShowPopup] = useState({ account: false, preferences: false });

  type UserMetadata = {
    name?: string;
    description?: string;
    difficulty?: string;
    cost?: string;
    accessibility?: string;
  };

  // Load user preferences from Clerk
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

  // Handle preference change
  const handlePreferenceChange = (field: string, value: string) => {
    setPreferences({ ...preferences, [field]: value });
  };

  // Save account info to Clerk
  const handleSaveAccountInfo = async () => {
    if (!user) return;
    try {
      await user.update({
        unsafeMetadata: {
          name: preferences.name, // Save name
          description: preferences.description, // Save description
          difficulty: preferences.difficulty,
          cost: preferences.cost,
          accessibility: preferences.accessibility
        },
      });

      setShowPopup({ ...showPopup, account: true });
      setTimeout(() => setShowPopup({ ...showPopup, account: false }), 2000);
    } catch (error) {
      console.error("Error saving account info:", error);
    }
  };

  // Save preferences to Clerk
  const handleSavePreferences = async () => {
    if (!user) return;
    try {
      await user.update({
        unsafeMetadata: {
          name: preferences.name, // Save name
          description: preferences.description, // Save description
          difficulty: preferences.difficulty,
          cost: preferences.cost,
          accessibility: preferences.accessibility
        },
      });

      try {
        const response = await axios.get('http://127.0.0.1:6464/create-itinerary', {
          params: {
            email: user?.primaryEmailAddress?.emailAddress,
            cost: preferences.cost,
            difficulty: preferences.difficulty,
            location: "Yellowstone"
          }
        });
        const res2 = await axios.get('http://127.0.0.1:6464/create-itinerary', {
          params: {
            email: user?.primaryEmailAddress?.emailAddress,
            cost: preferences.cost,
            difficulty: preferences.difficulty,
            location: "Yosemite National Park"
          }
        });
        console.log("Success.")
      }
      catch(error) {
        console.error("ERROR!", error);
      }

      setShowPopup({ ...showPopup, preferences: true });
      setTimeout(() => setShowPopup({ ...showPopup, preferences: false }), 2000);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        {["account", "preferences"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`py-2 px-4 focus:outline-none ${
              selectedTab === tab
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {selectedTab === "account" && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Account Information</h3>

            {/* Name Input */}
            <label className="block mt-4 font-medium">Name</label>
            <input
              type="text"
              value={preferences.name}
              onChange={(e) => handlePreferenceChange("name", e.target.value)}
              className="w-full p-2 mt-1 border rounded-md bg-gray-100 dark:bg-gray-700"
              placeholder="Enter your name"
            />

            {/* Description Input */}
            <label className="block mt-4 font-medium">Description</label>
            <textarea
              value={preferences.description}
              onChange={(e) => handlePreferenceChange("description", e.target.value)}
              className="w-full p-2 mt-1 border rounded-md bg-gray-100 dark:bg-gray-700"
              placeholder="Describe yourself"
            />

            {/* Save Button for Account Info */}
            <button
              onClick={handleSaveAccountInfo}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition"
            >
              Save Account Info
            </button>

            {/* Popup Notification for Account Info Saved */}
            {showPopup.account && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm px-4 py-2 rounded shadow-lg">
                Account Info Saved!
              </div>
            )}
          </div>
        )}

        {selectedTab === "preferences" && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Edit Your Preferences</h3>

            {/* Difficulty Selection */}
            <label className="block mt-4 font-medium">Difficulty Level</label>
            <select
              value={preferences.difficulty}
              onChange={(e) => handlePreferenceChange("difficulty", e.target.value)}
              className="w-full p-2 mt-1 border rounded-md bg-gray-100 dark:bg-gray-700"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

            {/* Cost Selection */}
            <label className="block mt-4 font-medium">Preferred Cost Level</label>
            <select
              value={preferences.cost}
              onChange={(e) => handlePreferenceChange("cost", e.target.value)}
              className="w-full p-2 mt-1 border rounded-md bg-gray-100 dark:bg-gray-700"
            >
              <option>$</option>
              <option>$$</option>
              <option>$$$</option>
              <option>$$$$</option>
            </select>

            {/* Accessibility Selection */}
            <label className="block mt-4 font-medium">Accessibility Requirement</label>
            <select
              value={preferences.accessibility}
              onChange={(e) => handlePreferenceChange("accessibility", e.target.value)}
              className="w-full p-2 mt-1 border rounded-md bg-gray-100 dark:bg-gray-700"
            >
              <option>Needs Accessible</option>
              <option>Doesn't Need Accessible</option>
            </select>

            {/* Save Button for Preferences */}
            <button
              onClick={handleSavePreferences}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition"
            >
              Save Preferences
            </button>

            {/* Popup Notification for Preferences Saved */}
            {showPopup.preferences && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm px-4 py-2 rounded shadow-lg">
                Preferences Saved!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}