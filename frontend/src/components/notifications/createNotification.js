import React from "react";
import Notification from "./notification.jsx";



function CreateNotification(message, id){
      
    return(

        <Notification
        message={message}
        ID={id}

        />


    )

}


export default CreateNotification;