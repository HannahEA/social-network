import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Registration from "./components/Registration";
import Home from "./components/Home";
import Login from "./components/Login";
//import Logout from "./components/Logout";
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
        <Route path="/login" element={authenticated ? <Navigate to="/feed" /> : <Login onLogin={handleLogin} />} />
        <Route path="/feed" element={authenticated ? <Feed onLogout = {handleLogout}/> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
