import React from "react";
//This is the component to display user information



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

    function calculateAge(dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const today = new Date();
    
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();
    
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }
    
        return age;
      }
    

return(

    <div className="card" style={{zIndex:998}}>
        <div className="top" >
            <img className="circle-img"  src={(props.avt).substring(0,3)==="" && (props.img).substring(0.3)==="" ? "https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj" :(props.avt).substring(0,3)==="htt" ? props.avt:props.img} alt="contact_img" style={{opacity:1}}/>
            {/* <img className="circle-img"  src={props.avt} alt="contact_img" /> */}
            <h2 className="name">{(props.name).length>10? (props.name).substring(0,7):props.name}</h2>
        </div>
        <div className="bottom flex">
            <div className="ml-2">
                <div className="info">Visibility: {props.visib} </div>
            {/* <Detail detailInfo= {props.visib} /> */}
            {/* </div> */}
            {/* <div class="flexbox-container"> */}
            <div className="info">Following:  {checkFollow()}</div>
            {/* <Detail detailInfo= {props.logged} /> */}
            {/* </div> */}
            <div className="info">About me:  {props.about} </div>
            </div>
            {/* <div class="flexbox-container"> */}
            {props.user.profVisib == 'public' || checkFollow() == 'Yes' ? 
            <div className="ml-2">
            <div className="info">Age: {calculateAge(props.user.age)} </div>
            {/* <Detail detailInfo= {props.visib} /> */}
            {/* </div> */}
            {/* <div class="flexbox-container"> */}
            <div className="info">Gender:  {props.user.gender}</div>
            {/* <Detail detailInfo= {props.logged} /> */}
            {/* </div> */}
            <div className="info">Email:  {props.user.email} </div>
            </div>: null}
            {props.user.profVisib == 'public' || checkFollow() == 'Yes' ? 
            <div className="ml-2">
            <div className="info">Name: {props.user.firstName}{props.user.lastName} </div>
            {/* <Detail detailInfo= {props.visib} /> */}
            {/* </div> */}
            {/* <div class="flexbox-container"> */}
            <div className="info">Follower:  {props.user.followers? props.user.followers.length: "0"}</div>
            {/* <Detail detailInfo= {props.logged} /> */}
            {/* </div> */}
            <div className="info">Following:  {props.user.following? props.user.following.length: "0"} </div>
            </div>: null}
            
        </div>
    </div>

);
}

export default Card
