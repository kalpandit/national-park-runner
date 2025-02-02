import { useState, useEffect } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";

export default function ProfileCard() {
  return (
    <div>
      <SignedIn>
        <Card />
      </SignedIn>
      <SignedOut>
        <p>Please sign in to access settings.</p>
      </SignedOut>
    </div>
  );
}

function Card() {
  const { user } = useUser();
  const [preferences, setPreferences] = useState({
    name: "",
    description: "",
    difficulty: "Moderate",
    cost: "$$",
    accessibility: "Doesn't Need Accessible",
  });

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
    }
  }, [user]);

  return (
    <div className="bg-white relative dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
      <img src='logo.png' className='m-auto w-18 h-18 absolute inset-x-0 -top-10 rounded-full shadow-xl'></img>
      <h2 className="mt-4 mb-3 text-3xl font-semibold">{preferences.name}</h2>
      <p className="text-gray-600 dark:text-gray-300">
        {preferences.description }
      </p>
    </div>
  );
}
