import React from "react";



function Alerts (props){
    console.log("show the props inside Alerts: ", props);


    <div className="counter" style={{visibility:`${props.dotVisible ? 'visible' : 'hidden'}`}}>
    
    {props.countFollowNotifs}
  </div>
}

export default Alerts