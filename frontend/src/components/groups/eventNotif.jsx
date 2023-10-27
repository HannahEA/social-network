import React from 'react';
import { useWebSocket } from "../WebSocketProvider.jsx";
//this is the event notification sent to a prospective participant that is online


function EventNotif ( props ) {
    //{console.log("new group info inside newGroupNotification component:", props.information)}
    {console.log("show the props inside EventNotif: ",props)}


    const { websocketRef, isWebSocketConnected} = useWebSocket();

    
    const handleAccept = () => {

    // Store user reply
    let reply = "Yes";
    // Make a reply object
    var YesNo = {
        "grpID": (props.groupData.grpID).toString(),
        "groupMember": (props.groupData.member),
        "joinReply": reply,
        "type": "joinGroupReply",
    };

    console.log("the joinGroupReply sent to back end: ", YesNo)

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
        "grpID": (props.groupData.grpID).toString(),
        "groupMember": (props.groupData.member),
        "joinReply": reply,
        "type": "joinGroupReply",
    };

    console.log("the joinGroupReply sent to back end: ", YesNo)
    //send user reply to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )
    // After handling the action, hide the Notification
    props.setGroupsVisible(false);

  };

  //format the yyyy-mm-ddThh:mm date-time in a readable format
  function formatDateTime(inputDateTime) {
    const parts = inputDateTime.split('T'); // Split the input by 'T' to separate date and time
  
    // Parse the date part and time part
    const datePart = parts[0];
    const timePart = parts[1];
  
    // Split the date into year, month, and day
    const [year, month, day] = datePart.split('-');
  
    // Split the time into hour and minute
    const [hour, minute] = timePart.split(':');
  
    // Create a new Date object with the components
    const date = new Date(year, month - 1, day, hour, minute);
  
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
  
    return date.toLocaleString('en-UK', options);
  }
  
  // Assuming props.eventData.evtDateTime is in the format "YYYY-MM-DDTHH:mm"
  const formattedDateTime = formatDateTime(props.eventData.evtDateTime);

    return (
    <div className="z-999 notification-item text-gray-600 font-normal text-sm mb-1.5 dark:text-gray-400 bg-[#9dd6f7]" style={{visibility:`${props.eventVisible ? 'visible' : 'hidden'}`}}>
      <p id="msg">Group <span className="font-semibold text-gray-700 dark:text-white">{props.eventData.grpName} </span>has a new event: </p>
      <br></br>
      <p id="grpN">Name: <span className="m-l-1 font-semibold text-gray-700 dark:text-white">{props.eventData.evtName}</span></p>
      <br></br>
      <p id="grpD">Description: <span className="font-semibold text-gray-700 dark:text-white">{props.eventData.evtDescr}</span></p>
      {/* <p id="grpT">Date & time: <span className="font-semibold text-gray-700 dark:text-white">{props.eventData.evtDateTime}</span></p> */}
      <p id="grpT">Date & time: <span className="font-semibold text-gray-700 dark:text-white">{formattedDateTime}</span></p>
      <span>
      <button id="btnNotifOK"
        onClick={handleAccept}
        style={{  hover:'#4488af',  backgroundColor: '#4488af' }}
      >
        View group event
      </button>
      </span>
    </div>
    ) 
};

export default EventNotif;