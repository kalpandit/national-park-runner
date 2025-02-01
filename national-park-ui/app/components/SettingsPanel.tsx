import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function SettingsPanel() {
  const [selectedTab, setSelectedTab] = useState("account");
  const [preferences, setPreferences] = useState({
    difficulty: "Moderate",
    cost: "$$",
    accessibility: "Doesn't Need Accessible",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handlePreferenceChange = (field, value) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const handleSavePreferences = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

  const deleteAccount = () => {
    console.log("Account deleted!"); // Replace with actual API call
    setIsConfirmOpen(false);
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        {["account", "preferences", "security"].map((tab) => (
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
        {selectedTab === "account" && <p>Manage your account details here.</p>}

        {/* Security Tab */}
        {selectedTab === "security" && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Update your security preferences here.
            </p>

            {/* Delete Account Button */}
            <button
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition"
              onClick={() => setIsConfirmOpen(true)}
            >
              Delete Account
            </button>
          </div>
        )}

        {/* Preferences Tab (UNCHANGED) */}
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
              <option>Moderate</option>
              <option>Difficult</option>
            </select>

            {/* Cost Selection */}
            <label className="block mt-4 font-medium">Preferred Cost Level</label>
            <select
              value={preferences.cost}
              onChange={(e) => handlePreferenceChange("cost", e.target.value)}
              className="w-full p-2 mt-1 border rounded-md bg-gray-100 dark:bg-gray-700"
            >
              <option>$ (Cheap)</option>
              <option>$$ (Moderate)</option>
              <option>$$$ (High)</option>
              <option>$$$$ (Ultra High-End)</option>
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

            {/* Save Button */}
            <button
              onClick={handleSavePreferences}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition"
            >
              Save Preferences
            </button>
          </div>
        )}
      </div>

      {/* Popup Notification for Preferences Saved */}
      {showPopup && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm px-4 py-2 rounded shadow-lg">
          Preferences Saved!
        </div>
      )}

      {/* Confirmation Modal for Delete Account */}
      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black bg-opacity-50" />

        <Dialog.Panel className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-sm mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Are you sure?</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Deleting your account is permanent and cannot be undone.
          </p>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400"
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={deleteAccount}
            >
              Confirm Delete
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
