export default function ProfileCard() {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
        <img
          src="/profile-avatar.jpg"
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto border-4 border-green-500"
        />
        <h2 className="mt-4 text-xl font-semibold">Jane Doe</h2>
        <p className="text-gray-600 dark:text-gray-300">Nature Explorer & Travel Enthusiast</p>
      </div>
    );
  }
  