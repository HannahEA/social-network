import React from "react";
import Avatar from "./Avatar";
import Detail from "./Detail";



function Card(props){
return(

    <div className="card" >
        <div className="top" >
            <img className="circle-img"  src={(props.avt).substring(0,3)=="htt" ? props.avt:props.img} alt="contact_img" />
            {/* <img className="circle-img"  src={props.avt} alt="contact_img" /> */}
            <h2 className="name">{(props.name).length>10? (props.name).substring(0,7):props.name}</h2>
        </div>
        <div className="bottom">
            {/* <div class="flexbox-container"> */}
            <div className="info">Visibility: {props.visib} </div>
            {/* <Detail detailInfo= {props.visib} /> */}
            {/* </div> */}
            {/* <div class="flexbox-container"> */}
            <div className="info">Logged in:  {props.logged} </div>
            {/* <Detail detailInfo= {props.logged} /> */}
            {/* </div> */}
            <div className="info">About me:  {props.about} </div>
        </div>
    </div>

);
}

export default Card
