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
    const userData = {
      email,
      password,
    };

    // Send POST request to the Go server with user data
    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Handle the response from the server
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="registration-page">
      <h2>Registration Page</h2>
      <form>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={handleEmailChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={handlePasswordChange} required />
        </div>
        <button type="button" onClick={handleRegistration}>
          Register
        </button>
      </form>
    </div>
  );
};

export default RegistrationPage;
