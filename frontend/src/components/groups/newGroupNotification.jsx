import React from 'react';
import { useWebSocket } from "../WebSocketProvider.jsx";



function NewGroupNotification ( props ) {
    {console.log("new group info inside newGroupNotification component:", props.information)}
    console.log("show the props inside NewGroupNotification: ",props)

    const { websocketRef, isWebSocketConnected} = useWebSocket();

    
    const handleAccept = () => {

    // Store user reply
    let reply = "Yes";
    // Make a reply object
    var YesNo = {
        "newGroupInfo": props.groupData,
        "followReply": reply,
        "type": "newGroupReply",
    };

    console.log("the followReply sent to back end: ", YesNo)

    //send reply object to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )
    // After handling the action, hide the Notification
    props.setGroupsVisible(false);

  };

  const handleNo = () => {
    //send to back end using the websocket:
    let reply = "No";
    // Make a reply object
    var YesNo = {
        "newGroupInfo": props.groupData,
        "followReply": reply,
        "type": "newGroupReply",
    };

    console.log("the followReply sent to back end: ", YesNo)
    //send user reply to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )
    // After handling the action, hide the Notification
    props.setGroupsVisible(false);

  };

    //return isVisible ? (
    return (
    <div className="notification-item" style={{ backgroundColor: '#7ca8c2', fontWeight:'strong', visibility:`${props.grNotifVisible ? 'visible' : 'hidden'}`}}>
      <p id="msg">{props.groupData.creator} has invited you to join his new group: </p>
      <p >Group name: {props.groupData.grpName}</p>
      <p >Group description: {props.groupData.grpDescr}</p>
      <span>
      <button id="btnNotifOK" className="hover:bg-[#2e5d78]"
        onClick={handleAccept}
        style={{ backgroundColor: '#4488af' }}
      >
        Accept
      </button>
      </span>
      
      <span>
      <button id="btnNotifNO" className="hover:bg-[#2e5d78]"
        onClick={handleNo}
        style={{ backgroundColor: '#4488af', fontWeight: 'strong' }}
      >
        Decline
      </button>
      </span>
    </div>
    ) //: null; // Render null when isVisible is false
};

export default NewGroupNotification;