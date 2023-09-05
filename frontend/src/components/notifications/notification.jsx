import React from 'react';
import { useWebSocket } from "../WebSocketProvider.jsx";



const Notification = ({ prop }) => {
    const { websocketRef, isWebSocketConnected} = useWebSocket();
    console.log("show if the WS is connected: ",isWebSocketConnected)

    const handleAccept = () => {
    // Send a request to the backend with followID and the user's acceptance
    // You can use fetch or any other method for this purpose.
    // Example:
    // fetch('/api/acceptFollow', {
    //   method: 'POST',
    //   body: JSON.stringify({ ID, accepted: true }),
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    // .then(response => {
    //   // Handle the response as needed
    // })

    //Using the websocket:

    // Store user reply
    let reply = "Yes";
    // Make a reply object
    var YesNo = {
        "followID": prop.ID,
        "followReply": reply,
        "type": "followReply",
    };
    console.log("the followReply sent to back end: ", YesNo)

    //send reply object to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )

  };

  const handleDecline = () => {
    //send to back end using the websocket:
    let reply = "No";
    // Make a reply object
    var YesNo = {
        "followID": prop.ID,
        "followReply": reply,
        "type": "followReply",
    };
    console.log("the followReply sent to back end: ", YesNo)

    //send user reply to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )
  };


    <div className="notification" style={{ backgroundColor: '#9dd6f7', fontWeight:'strong' }}>
      <p>{prop.message}</p>
      <button
        onClick={handleAccept}
        style={{ backgroundColor: '#4488af' }}
      >
        Accept
      </button>
      <button
        onClick={handleDecline}
        style={{ backgroundColor: '#4488af', fontWeight: 'strong' }}
      >
        Decline
      </button>
    </div>

};

export default Notification;
