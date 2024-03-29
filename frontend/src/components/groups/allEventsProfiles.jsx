import React from "react";
import { useWebSocket } from '../WebSocketProvider';

//This component renders existing events on group's profile page

function AllEventsProfiles(props){

{console.log("the group events inside the AllEventsProfiles component: +=+=+=+=+=> ",props.gpEvents)}
{console.log("the event participant inside the AllEventsProfiles component: &&&&&&> ",props.user)}


const { websocketRef, isWebSocketConnected} = useWebSocket();

 //event creator or attendee will attend the event
 const handleGoing = (event) => {

    //Store user reply
    let reply = "going";
    // Make a reply object
    var YesNo = {
        "evtName": event.evtName,
        "evtMember": props.user,
        "reply": reply,
        "type": "attendEventReply",
    };

    console.log("the attendEventReply sent to back end: ", YesNo)
    console.log("the event.id value is:", event.id)

    //clear buttons and show reply
    document.getElementById(event.id).innerHTML=""
    document.getElementById(event.id).innerHTML="You are "+reply
    //style the answer
    let opt = document.getElementById(event.id)
    opt.classList.add('pl-24', 'py-6', 'allGroups', 'font-extrabold', 'text-[#3089bd]', 'dark:text-[#3f82a9]')
    //send reply object to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )

  };

//event creator or attendee will not attend the event
  const handleNotGoing = (event) => {
    //send to back end using the websocket:
    let reply = "not going";
    // Make a reply object
    var YesNo = {
        "evtName": event.evtName,
        "evtMember": props.user,
        "reply": reply,
        "type": "attendEventReply",
    };

    console.log("the joinGroupReply sent to back end: ", YesNo)
    //clear buttons and show reply
    document.getElementById(event.id).innerHTML=""
    document.getElementById(event.id).innerHTML="You are "+reply
    //style the answer
    let opt = document.getElementById(event.id)
    opt.classList.add('pl-24', 'py-6', 'allGroups', 'font-extrabold', 'text-[#3089bd]', 'dark:text-[#3f82a9]')
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


// Group events into rows of three
  var eventsInRows = [];
  //if number of events <=4 there are no rows
  if (parseInt(props.gpEvents.nbEvents, 10) <= 4){
    for (let i = 0; i < parseInt(props.gpEvents.nbEvents, 10); i++){
        eventsInRows.push(props.gpEvents.sliceOfEvents[i]);
        }
    }else{
      //make rows by creating sub-slices of 4 elements each
    for (let i = 0; i < props.gpEvents.sliceOfEvents.length; i += 4) {
        var eventRow = props.gpEvents.sliceOfEvents.slice(i, i + 4);
        eventsInRows.push(eventRow);
       }
    }

    // Debug: Log eventsInRows
    console.log('eventsInRows:', eventsInRows);

      // function to render an individual event
  const renderEvent = (event) => (
    <div key={event.id} className="addAllEvents">
      <p style={{ fontSize: 18, lineHeight: "20px", fontWeight: "bold", color: "#29aaf5", paddingBottom: "10px", paddingTop: "10px", paddingLeft: "100px" }}>Event invite</p>
      <p style={{paddingLeft: "10px" }} id="evt">Will you attend this event,<span style={{ fontWeight: "semibold", color: "#53a9db", padding: "2px"}}>{props.user}</span>?</p>
      <p style={{paddingLeft: "10px" }}>Name: <span style={{ fontWeight: "semibold", color: "#53a9db"}}>{event.evtName}</span></p>
      <p style={{paddingLeft: "10px" }}>Description: <span style={{ fontWeight: "semibold", color: "#53a9db" }}>{event.evtDescr}</span></p>
      <p style={{paddingLeft: "10px" }}>Date & time: <span style={{ fontWeight: "semibold", color: "#53a9db" }}>{formatDateTime(event.evtDateTime)}</span></p>

      {event.evtOption === "participantPending" ? (
        <div id={event.id}>
          <button
            id="btnEventOK"
            onClick={() => handleGoing(event)}
            style={{ paddingLeft: "20px", backgroundColor: "#29aaf5", color: "white", fontWeight: "strong", padding: "10px" }}
          >
            Going
          </button>
          <button
            id="btnEventNO"
            onClick={() => handleNotGoing(event)}
            style={{ backgroundColor: "#29aaf5", color: "white", fontWeight: "strong", padding: "10px" }}
          >
            Not going
          </button>
        </div>
      ) : (
        <div id="eGoingReply">
          <p className="pl-24 py-6 allGroups font-extrabold text-[#3089bd] dark:text-[#3f82a9]">You are <span style={{ fontWeight: "800", color:'#3089bd' }}>{event.evtOption}</span></p>
        </div>
      )}
    </div>
  );


// Render events in rows of four events
return (
  <div style={{ height: "max-content" }} className="addEvt justify-around">
    {(parseInt(props.gpEvents.nbEvents, 10) || 0) === 0 ? (
      <label className="allGroups text-[#4893be] dark:text-[#3f82a9]">
        There are no events for this group
      </label>
    ) : (
      (() => {
        return eventsInRows.map((eventRow, rowIndex) => (
          <div key={rowIndex} className="event-row" style={{ justifyContent: "flex-start" }}>
            {console.log("is eventRow an array?=====++++>>", Array.isArray(eventRow))}
            {Array.isArray(eventRow) ? (
              eventRow.map((event) => {
                console.log('Event:', event);
                return renderEvent(event); // Return to render the component
              })
            ) : (
              // Handle the case when eventRow is not an array (i.e., is a single event)
              <React.Fragment key={eventRow.id}>
                {console.log("the rowIndex",rowIndex)}
                {/* Render the additional events in the same container */}
                {eventsInRows.slice(0, Math.min(eventsInRows.length, 4)).map((additionalEvent) => (
                  (rowIndex == 0) ? (renderEvent(additionalEvent) ) : (
                    
                    
                    //clear the events array to prevent duplicate rendering
                    eventsInRows = []
                    
                    )
                ))}
              </React.Fragment>
            )}
          </div>
        ));
      })()
    )}
  </div>
);



}

export default AllEventsProfiles;