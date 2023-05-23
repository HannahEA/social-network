import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf(); // Create a single instance of Notyf

const handleLogout = ({onLogout})  => {
    Event.preventDefault(); // Prevent default form submission

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
   body: JSON.stringify(objDeleteCookie)

};

fetch("/logout", configLogout)
.then(function (response) {
  console.log(response);
  if (response.status == 200) {
    console.log("successful logout");

  } else {
    console.log("unccessful logout");

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