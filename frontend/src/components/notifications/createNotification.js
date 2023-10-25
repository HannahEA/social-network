import React from "react";
import Notification from "./notification.jsx";
//this component is currently not being used


function CreateNotification(message, id){
      
    return(

        <Notification
        message={message}
        ID={id}

        />


    )

}


export default CreateNotification;