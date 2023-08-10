import React from "react";
import Avatar from "./Avatar";
import Detail from "./Detail";



function Card(props){
return(

    <div className="card" >
        <div className="top" >
            <p>{props.id}</p>
            <h2 className="name">{props.username}</h2>
            {/* <img className="circle-img" src={props.img} alt="contact_img" /> */}
            <Avatar img={props.image} />
        </div>
        <div className="bottom">
            <Detail detailInfo= {props.profVisib} />
            <Detail detailInfo= {props.loggedIn} />
        </div>
    </div>

);
}

export default Card
