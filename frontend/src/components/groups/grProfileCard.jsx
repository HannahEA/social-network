import React from "react";

//This is the group profile component


function GrProfileCard(props){

    
    

return(

    <div className="gpCard" >
        <div className="gpTop absolute align-middle" >
            <img className="circle-img"  src="https://thumbs.dreamstime.com/z/happy-smiling-diverse-employees-group-multiethnic-colleagues-staff-asian-muslim-businesswoman-team-leader-putting-stacked-221756250.jpg?w=992" alt="contact_img" />
            <h2 className="name">{props.theGroup.grpName}</h2>
        </div>
        <div className="gpBottom flex">
            <div className="ml-2">
            <div className="info">Description: {props.theGroup.grpDescr} </div>
            <div className="info">Creator:  {props.theGroup.creator}</div>
            <div className="info">Members:  {props.theGroup.gpMembers.join(' ')} </div>
            </div>
            
        </div>
        
    </div>
    
);
}

export default GrProfileCard
