import React from 'react';
import { useWebSocket } from "../WebSocketProvider.jsx";



function Notification ( props ) {
    const { websocketRef, isWebSocketConnected} = useWebSocket();
    console.log("show the props inside Notification: ",props)
    console.log("show if the WS is connected inside Notification: ",isWebSocketConnected)

    
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
        "followID": props.ID,
        "followReply": reply,
        "type": "followReply",
    };
    console.log("the followReply sent to back end: ", YesNo)

    //send reply object to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )
     
  };

  const handleNo = () => {
    //send to back end using the websocket:
    let reply = "No";
    // Make a reply object
    var YesNo = {
        "followID": props.ID,
        "followReply": reply,
        "type": "followReply",
    };
    console.log("the followReply sent to back end: ", YesNo)
    //send user reply to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )
  };

    return <>
    <div className="notification-item" style={{ backgroundColor: '#9dd6f7', fontWeight:'strong', visibility:'visible'}}>
      <p id="msg">{props.message}</p>
      <span>
      <button class="btnNotifOK" className="hover:bg-[#2f5d78] "
        onClick={handleAccept}
        style={{ backgroundColor: '#4488af' }}
      >
        Accept
      </button>
      </span>
      
      <span>
      <button class="btnNotifNO" className="hover:bg-[#2e5d78] "
        onClick={handleNo}
        style={{ backgroundColor: '#4488af', fontWeight: 'strong' }}
      >
        Decline
      </button>
      </span>
    </div>
    </>

};

export default Notification;
