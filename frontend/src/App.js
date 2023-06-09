import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import RegistrationPage from "./components/Registration";
import Home from "./components/Home";
import Login from "./components/Login";
import Feed from "./components/Feed";
import {TopNavigation, ThemeIcon} from "./components/TopNavigation";
  const apiURL = process.env.REACT_APP_API_URL;
function App() {

  const [authenticated, setAuthenticated] = useState(false);

  const handleLogin = () => {
    // Perform login logic
    setAuthenticated(true);
  };

  const handleLogout = () => {
    // Perform logout logic
    setAuthenticated(false);
  };


  

  // const [userAvatar, setUserAvatar] = useState("");
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home onLogout={handleLogout} />} />
        <Route path="/" element={<TopNavigation />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </Router>
  );
}

export default App;
