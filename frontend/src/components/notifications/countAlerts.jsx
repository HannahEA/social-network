import React from "react";

function Alerts (props){
    <div className="counter" style={{visibility:`${props.dotVisible ? 'visible' : 'hidden'}`}}>
    {props.countFollowNotifs}
  </div>
}

export default Alerts