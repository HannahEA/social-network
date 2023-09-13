import React from "react";
// import Avatar from "./Avatar";
// import Detail from "./Detail";



function Card(props){

    const checkFollow = () => {
        if(props.influencer === 1 ){ 
        return "Yes"
        } else if (props.influencer === 2) { 
        return `Awaiting ${props.name} reply`
        } else {
        return "No"
        };
    }
    

return(

    <div className="card" >
        <div className="top" >
            <img className="circle-img"  src={(props.avt).substring(0,3)==="" && (props.img).substring(0.3)==="" ? "https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj" :(props.avt).substring(0,3)==="htt" ? props.avt:props.img} alt="contact_img" />
            {/* <img className="circle-img"  src={props.avt} alt="contact_img" /> */}
            <h2 className="name">{(props.name).length>10? (props.name).substring(0,7):props.name}</h2>
        </div>
        <div className="bottom">
            {/* <div class="flexbox-container"> */}
            <div className="info">Visibility: {props.visib} </div>
            {/* <Detail detailInfo= {props.visib} /> */}
            {/* </div> */}
            {/* <div class="flexbox-container"> */}
            <div className="info">Following:  {checkFollow()}</div>
            {/* <Detail detailInfo= {props.logged} /> */}
            {/* </div> */}
            <div className="info">About me:  {props.about} </div>
        </div>
    </div>

);
}

export default Card
