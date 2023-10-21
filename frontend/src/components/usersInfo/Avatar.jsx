import React from "react";
//This is the round picture component

function Avatar(prop){
    // return <img className="circle-img" src={prop.img} alt="avatar_img"/>;
    return <img className="circle-img" src={(prop.avt).substring(0,3)=="htt" ? prop.avt:prop.img} alt="avatar_img"/>;
    //return <img className="circle-img" src="//www.google.com/url?sa=i&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FLee_Radziwill&psig=AOvVaw2F2D3JNDkM2wrNbKtSPKs5&ust=1691856578327000&source=images&cd=vfe&opi=89978449&ved=0CA0QjRxqFwoTCOiV-4j_1IADFQAAAAAdAAAAABAN" alt="avatar_img"/>;
};

export default Avatar;