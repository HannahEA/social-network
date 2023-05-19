import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to our Social Media App!</h1>
      <p className="text-lg mb-8">Connect with friends, share your thoughts, and discover new experiences.</p>
      <Link
        to="/registration"
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300"
      >
        Get Started
      </Link>
    </div>
  );
};

export default Home;
