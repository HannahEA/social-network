import React from "react";
import { useWebSocket } from "../WebSocketProvider.jsx";


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