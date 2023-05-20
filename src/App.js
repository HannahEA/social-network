import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Registration from "./components/Registration";
import Home from "./components/Home";
import Login from "./components/Login";

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
        <Route path="/login" element={authenticated ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
        <Route path="/home" element={authenticated ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
