import React, { useState } from "react";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const notyf = new Notyf();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = () => {
    // Create an object with the form data
    const formData = {
      email: email,
      password: password,
    };

    // Make a POST request to the server
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        console.log(data);

        // Check if the login was successful
        if (data.message === "Login successful") {
          // Display a success notification
          notyf.success("Login successful");

          // Perform any additional logic (e.g., redirecting to a different page)
        } else if (data.message === "Invalid credentials") {
          notyf.error("Invalid credentials");
        }
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  };

  return (
    <div className="login-page min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl mb-4">Login Page</h2>
        <form>
          <div className="mb-4">
            <label className="block mb-2">Email:</label>
            <input type="email" className="w-full border rounded p-2" value={email} onChange={handleEmailChange} required />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Password:</label>
            <input type="password" className="w-full border rounded p-2" value={password} onChange={handlePasswordChange} required />
          </div>
          <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleLogin}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
