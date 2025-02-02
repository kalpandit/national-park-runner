import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const Register = () => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-r">
      {/* Header */}
      <header className="bg-green-800 p-4">
        <h1 className="text-3xl font-bold text-center text-gray-100">Trail Runner</h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-grow justify-center items-center">
        <div className="bg-white p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Register</h2>
          <SignUp
            path="/register"
            routing="path"
            signInUrl="/login"
            afterSignUpUrl="/profile"
          />
        </div>
      </main>
    </div>
  );
};

export default Register;