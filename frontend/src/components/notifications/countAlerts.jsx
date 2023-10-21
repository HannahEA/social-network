import React from "react";
import { useWebSocket } from "../WebSocketProvider.jsx";
//shows a red dot and the number of pending alerts for (previously) offline user

function Alerts (props){
    // console.log("show the props inside Alerts: ", props);


return (
  <div>

   {/* {console.log("inside alerts:",props.countFollowNotifs)}  */}
  
  {props.countFollowNotifs}

  
</div>
)

}

export default Alerts