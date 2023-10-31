import React from 'react';
//this is the event notification sent to a prospective participant that is online


function EventNotif ( props ) {
    //{console.log("new group info inside newGroupNotification component:", props.information)}
    {console.log("show the props inside EventNotif: ",props)}



  //make the group profile page visible
   const handleOpenGpProfile = () => {
      props.setGrpProfileVisible(true);
      props.close()
   };



  //change state variable object 'setGrp' 
    const handleSelectGrp = () => {
       props.setGrp((prevState) => ({
            ...prevState,
            id: props.eventData.grpID,
            creator: props.eventData.grpCreator,
            gpMembers: props.eventData.grpMembers,
            grpDescr: props.eventData.grpDescr,
            grpName: props.eventData.grpName,
            type: "arrayOfGroups"
        }
       )
     ) 
    }



  //change format of the 'yyyy-mm-ddThh:mm' date-time to a 'dd-mm-yyyy hh:mm' format
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
    <div className="z-999 evtNotification-item text-gray-600 font-normal text-sm mb-1.5 dark:text-gray-400 bg-[#9dd6f7]" style={{visibility:`${props.eventVisible ? 'visible' : 'hidden'}`}}>
      <p id="msg">Group <span className="font-semibold text-gray-700 dark:text-white">{props.eventData.grpName} </span>has a new event: </p>
      <br></br>
      <p id="grpN">Name: <span className="m-l-1 font-semibold text-gray-700 dark:text-white">{props.eventData.evtName}</span></p>
      <br></br>
      <p id="grpD">Description: <span className="font-semibold text-gray-700 dark:text-white">{props.eventData.evtDescr}</span></p>
      <p id="grpT">Date & time: <span className="font-semibold text-gray-700 dark:text-white">{formattedDateTime}</span></p>
      <span>
      <button id="btnViewEvent"
        onClick={() => {
                          {console.log("group creator, event creator, and event participant:", props.eventData.grpCreator, props.eventData.evtCreator, props.eventData.evtMember)}
                         props.eventData.grpMembers === null || (props.eventData.evtCreator == props.eventData.evtMember && props.eventData.grpMembers.includes(props.eventData.evtMember) === false) ? props.setGrpMember(false): props.setGrpMember(true)
                        handleOpenGpProfile();
                        handleSelectGrp();
                        }}
        style={{  hover:'#4488af',  backgroundColor: '#4488af' }}
      >
        View event in group profile
      </button>
      </span>
    </div>
    ) 
};

export default EventNotif;