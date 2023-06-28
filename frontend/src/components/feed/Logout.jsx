import React, { useState } from "react";

import { redirect } from "react-router-dom";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf(); // Create a single instance of Notyf

// Environment variable from the docker-compose.yml file. 
//This variable will contain the URL of the backend service, 
//allowing the frontend code to make requests to the correct endpoint.
const apiURL = process.env.REACT_APP_API_URL;
//const apiURL = "http://localhost:8000"


const handleLogout = (event, setAuthToFalse)  => {
    
    event.preventDefault(); 

//remove cookie from browser when logout
//function LogoutDeleteCookie(){
	let deleteCookie = GetCookie("user_session");
  console.log({deleteCookie})
  let objDeleteCookie = {
    toDelete: deleteCookie,
  }
  console.log({objDeleteCookie})
  let configLogout = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
   body: JSON.stringify(objDeleteCookie),
   credentials: 'include',
};

fetch(`${apiURL}/logout`, configLogout)
.then(function (response) {
  console.log(response);
  if (response.status == 200) {
    console.log("successful logout");
    setAuthToFalse();
    redirect("/")

  } else {
    console.log("unsuccessful logout");

  }
})
//}
}

//get session cookie
const GetCookie = (name) => {
    //split cookie string
    //name equals to value pairs in an array
    var CookieArr = document.cookie.split(';');
    console.log(CookieArr)
    
    //loop through array elements
    for(var i=0; i < CookieArr.length; i++) {
      var cookiePair = CookieArr[i].split('=');
      console.log(cookiePair)
      //removing unnecessary spaces
      if(name == cookiePair[0].trim()){
       
        console.log(cookiePair[1]) 
        return cookiePair[1];
      }
    }
    return null;
  }

  export default handleLogout;