import React from 'react';
import { useWebSocket } from '../WebSocketProvider';
//this is the event profile shown on the group profile page
//after event organizer has pressed 'create event' button


function EventProfile(props){

    const { websocketRef, isWebSocketConnected} = useWebSocket();

 //event creator or attendee will attend the event
 const handleGoing = () => {

    //Store user reply
    let reply = "going";
    // Make a reply object
    var YesNo = {
        "evtName": props.newEvt.name,
        "evtMember": props.newEvt.request,
        "reply": reply,
        "type": "attendEventReply",
    };

    console.log("the attendEventReply sent to back end: ", YesNo)
    //clear buttons and show reply
    document.querySelector("#eGoingReply").innerHTML=""
    document.querySelector("#eGoingReply").innerHTML="You are "+reply
    //send reply object to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )

  };

//event creator or attendee will not attend the event
  const handleNotGoing = () => {
    //send to back end using the websocket:
    let reply = "not going";
    // Make a reply object
    var YesNo = {
        "evtName": props.newEvt.name,
        "evtMember": props.newEvt.request,
        "reply": reply,
        "type": "attendEventReply",
    };

    console.log("the joinGroupReply sent to back end: ", YesNo)
    //clear buttons and show reply
      document.querySelector("#eGoingReply").innerHTML=""
      document.querySelector("#eGoingReply").innerHTML="You are "+reply
    //send user reply to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )

  };

  //format date-time 'yyyy-mm-ddThh:mm' format to a 'dd/mm/yyyy hh:mm' format
  function formatDateTime(inputDateTime) {
    const parts = inputDateTime.split('T'); // Split the input by 'T' to separate date and time
  
    const datePart = parts[0];
    const timePart = parts[1];
  
    const [year, month, day] = datePart.split('-');
  
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


//Show event profile on group profile page
return (
    <div className="addEvt">
      <p style={{fontSize:18, lineHeight:"20px", font:"bold", marginLeft:100+"px", text:"center", color:"#53a9db", padding:"10px"}} > Event invite </p>
      <p id="evt" style={{marginLeft:5+"px", font: "semibold", color: "gray", paddingRight: 1+"px" }}>Will you attend this event, <span style={{font:"semibold", text:"#53a9db"}} > {props.newEvt.request} </span> ? </p>
      <p style={{marginLeft:5+"px", color:"gray", paddingRight:10+"px"}}>Name: <span style={{font:"semibold", color:"#53a9db"}}>{props.newEvt.evtName}</span></p>
      <p style={{marginLeft:5+"px", color:"gray", paddingRight:10+"px"}}>Description: <span style={{font:"semibold", color:"#53a9db"}}>{props.newEvt.evtDescr}</span></p>
      <p style={{marginLeft:5+"px", color:"gray", paddingRight:10+"px"}}>Date & time: <span style={{font:"semibold", color:"#53a9db"}}>{formatDateTime(props.newEvt.evtDateTime)}</span></p>
      <div id="eGoingReply">
        <span>
            <button id="btnEventOK"
             onClick={handleGoing}
            style={{hover:"#3488af", backgroundColor:"#57aada", text:"white", fontWeight:"strong", marginLeft:50+"px", marginTop:10+"px", padding:10+"px"}}
            >
                Going
            </button>
      </span>
      <span>
            <button id="btnEventNO"
            onClick={handleNotGoing}
            style={{hover:"#3488af", backgroundColor:"#57aada", text:"white", fontWeight:"strong", padding:10+"px"}}
            >
                Not going
            </button>
      </span>
    </div>
    </div>
    
    
    

)

}

export default EventProfile

 