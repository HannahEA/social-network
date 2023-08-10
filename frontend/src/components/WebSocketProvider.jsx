// WebSocketProvider.js

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext();

const WebSocketProvider = ({ children }) => {
  const [isWebSocketConnected, setWebSocketConnected] = useState(false);
  

  const websocketRef = useRef(null);

  useEffect(() => {
    console.log(websocketRef.current)
    if (!websocketRef.current) {
      websocketRef.current = new WebSocket("ws://localhost:8000/websocket");

      websocketRef.current.onopen = (e) => {
        console.log("WebSocket Connection Successfully Opened");
        setWebSocketConnected(true);
        websocketRef.current.send(
          JSON.stringify({
            type: "connect",
            cookie: document.cookie,
          })
        );
      };

    //   websocketRef.current.onmessage = (e) => {
    //     // Handle WebSocket messages here
    //             let message = JSON.parse(e.data)
    //       console.log(message)
    //       allData.current.presences = message.presences.clients
    //       console.log(allData.current.presences)
    //   };

      websocketRef.current.onclose = () => {
        console.log("WebSocket connection ended");
        setWebSocketConnected(false);
        websocketRef.current = null; // Reset the ref to null
      };
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ websocketRef, isWebSocketConnected}}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export default WebSocketProvider;