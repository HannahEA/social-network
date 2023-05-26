import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    // Perform your login logic here
    // Set isAuthenticated to true upon successful login
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Perform your logout logic here
    // Set isAuthenticated to false upon successful logout
    setIsAuthenticated(false);
  };

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
};
