import React, { useState } from "react";

const RegistrationPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleRegistration = () => {
    // Code for handling registration
  };

  return (
    <div className="registration-page min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl mb-4">Registration Page</h2>
        <form>
          <div className="mb-4">
            <label className="block mb-2">Email:</label>
            <input type="email" className="w-full border rounded p-2" value={email} onChange={handleEmailChange} required />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Password:</label>
            <input type="password" className="w-full border rounded p-2" value={password} onChange={handlePasswordChange} required />
          </div>
          <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleRegistration}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
