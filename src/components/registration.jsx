import React, { useState } from "react";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

const RegistrationPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registered, setRegistered] = useState(false);
  const notyf = new Notyf();
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleRegistration = () => {
    const formData = {
      email: email,
      password: password,
    };

    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.message === "Registration successful") {
          notyf.success("Registration successful");

          setRegistered(true);

          navigate("/login");
        } else if (data.message === "Email already taken") {
          notyf.error("Email already taken");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  if (registered) {
    return <Login />;
  }

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
