import React from "react";
import Card from "./Card.jsx";



function createCard(u){
      
    return(

        <Card 
        id={u.id}
        key={u.id}
        name={u.username}
        avt={u.avatar}
        img={u.image}
        visib={u.profVisib}
        email={u.loggedIn}
        />


    )

}


export default createCard;