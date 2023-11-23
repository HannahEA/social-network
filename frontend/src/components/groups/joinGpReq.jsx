import React from 'react';
import { useWebSocket } from "../WebSocketProvider.jsx";
//this is a join group request notification sent to group creator that is online


function JoinGpReq ( props ) {
    {console.log("join group request inside JoinGpReq component:", props.joinRequest)}
    {console.log("show the props inside NewGroupNotification: ",props)}


    const { websocketRef, isWebSocketConnected} = useWebSocket();

    
    const handleAccept = () => {

    // Store user reply
    let reply = "Yes";
    // Make a reply object
    var YesNo = {
        "grpID": (props.joinRequest.grpID),
        "groupMember": (props.joinRequest.joinRequestBy),
        "joinReply": reply,
        "type": "joinGroupReply",
    };

    console.log("the joinGroupReply sent to back end: ", YesNo)

    //send reply object to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )
    // After handling the action, hide the Notification
    props.setJoinGpVisible(false);

  };

  const handleNo = () => {
    //send to back end using the websocket:
    let reply = "No";
    // Make a reply object
    var YesNo = {
        "grpID": (props.joinRequest.grpID),
        "groupMember": (props.joinRequest.joinRequestBy),
        "joinReply": reply,
        "type": "joinGroupReply",
    };

    console.log("the joinGroupReply sent to back end: ", YesNo)
    //send user reply to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )
    // After handling the action, hide the Notification
    props.setJoinGpVisible(false);

  };

    return (
    <div className="notification-item text-gray-600 font-normal text-sm mb-1.5 dark:text-gray-400 bg-[#9dd6f7]" style={{zIndex:998, visibility:`${props.joinGrVisible ? 'visible' : 'hidden'}`}}>
      <br></br>
      <br></br>
      <br></br>
      <p id="msg"><span className="font-semibold text-gray-700 dark:text-white">{props.joinRequest.joinRequestBy} </span>wishes to join your group: </p>
      <br></br>
      <br></br>
      <br></br>
      <p id="grpN">Name: <span className="font-semibold text-gray-700 dark:text-white">{props.joinRequest.grpName}</span></p>
      <br></br>
      <p id="grpD">Description: <span className="font-semibold text-gray-700 dark:text-white">{props.joinRequest.grpDescr}</span></p>
      <span>
      <button id="btnNotifOK"
        onClick={handleAccept}
        style={{  hover:'#4488af',  backgroundColor: '#4488af' }}
      >
        Accept
      </button>
      </span>
      
      <span>
      <button id="btnNotifNO"
        onClick={handleNo}
        style={{ hover:'#4488af', backgroundColor: '#4488af', fontWeight: 'strong' }}
      >
        Decline
      </button>
      </span>
    </div>
    )
};

export default JoinGpReq;