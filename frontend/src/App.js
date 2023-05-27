import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Registration from "./components/Registration";
import Home from "./components/Home";
import Login from "./components/Login";
import Feed from "./components/Feed";

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home onLogout={handleLogout} />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </Router>
  );
}

export default App;
