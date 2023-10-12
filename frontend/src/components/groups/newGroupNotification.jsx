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
        "groupId": (props.groupData.grpID).toString(),
        "groupMember": (props.groupData.member),
        "followReply": reply,
        "type": "joinGroupReply",
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
        "groupId": (props.groupData.grpID).toString(),
        "groupMember": (props.groupData.member),
        "followReply": reply,
        "type": "joinGroupReply",
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
    <div className="z-999 notification-item text-gray-600 font-normal text-sm mb-1.5 dark:text-gray-400 bg-[#9dd6f7]" style={{visibility:`${props.grNotifVisible ? 'visible' : 'hidden'}`}}>
      <p id="msg"><span className="font-semibold text-gray-700 dark:text-white">{props.groupData.creator} </span>has invited you to join the group: </p>
      <br></br>
      <br></br>
      <br></br>
      <p id="grpN">Group name: <span className="font-semibold text-gray-700 dark:text-white">{props.groupData.grpName}</span></p>
      <br></br>
      <p id="grpD">Group description: <span className="font-semibold text-gray-700 dark:text-white">{props.groupData.grpDescr}</span></p>
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
    ) //: null; // Render null when isVisible is false
};

export default NewGroupNotification;