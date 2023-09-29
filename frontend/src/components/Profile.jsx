import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { SubmitPost, Tags, Posts } from "./feed/Posts";
import { TopNavigation, ThemeIcon } from "./TopNavigation.jsx";
import { useLocation } from "react-router-dom";
import { Notyf } from "notyf";

const notyf = new Notyf();

const apiURL = process.env.REACT_APP_API_URL;




const deleteCookie = () => {
  fetch(`${apiURL}/deleteCookie`, { credentials: "include" })
    .then((response) => response.text())
    .then((data) => {
      // Handle the response from the server
      console.log("Sending cookie to be deleted:", data);

      // Redirect to the feed page if the cookie is found
      if (data === "Cookie is deleted") {
        console.log("Cookie is deleted from server");

        // Remove the cookie from the client-side
        document.cookie = "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Notify the user
        notyf.success("Logout successful.");

        // Redirect to the welcome page
        const navigate = useNavigate();
        navigate("/");
      } else {
        console.log("Cookie is not deleted");
      }
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error:", error);
    });
};

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [dateOfBirth, setAge] = useState("");
  const [avatar, setAvatar] = useState("");
  const [image, setImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [profileVisib, setProfileVisib] = useState("public");
  const [isDarkTheme, setDarkTheme] = useState(false);
  const [sPost, setSpost] = useState("");
  //changes user profile visibility
  //from 'public' to 'private' and vice versa
  //and update the database with new visibility

  const changeProfileVisibility = () => {
    if (profileVisib === "private") {
      setProfileVisib("public");
    } else if (profileVisib === "public") {
      setProfileVisib("private");
    }
  };


 // useEffect hook to trigger the POST request whenever profileVisib changes
 useEffect(() => {
  const updateVisibility = {
    profVisib: profileVisib, // Use the updated state directly here
    username: username,
  };

  // Make a POST request to update profileVisibility in the database
  fetch(`${apiURL}/profleVisibility`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateVisibility),
    credentials: 'include',
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      if (data.message === "Visibility update successful") {
        console.log(data);
      } else {
        console.log("Visibility update unsuccessful", data);
      }
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error:", error);
    });
}, [profileVisib]); // The effect will only run when profileVisib changes

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

  // Make a POST request to the server
  const checkCookie = () => {
    fetch(`${apiURL}/checkCookie`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        console.log("Data:", data);
        setEmail(data.email);
        setUsername(data.username);
        setAboutMe(data.aboutMe);
        setAge(data.age);
        setAvatar(data.avatar);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        if (!data.image && !data.avatar){
          setImage("https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj")
        }
        else if (!data.image){
          setImage(data.avatar)
        }else{
          setImage(data.image)
        }
        setGender(data.gender);
        setProfileVisib(data.profVisib);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    checkCookie();
  }, []);

  console.log("email:", email);
  return (

        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-24 h-24 border-gradient border-4 border-[#57aada] rounded-[50%] overflow-hidden">
                <img className="w-full h-full object-cover" src={image} alt="" />
              </div>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-[#57aada] text-2xl font-semibold">
                <div>
                  <div className="flex items-center justify-center "></div>
                  {firstName} {lastName}{" "}
                </div>
              </h3>
              <div>
                  <span>
                  <p className="text-gray-500 text-lg dark:text-gray-200 mb-0.5">This Profile is Curently <strong>{profileVisib}</strong></p>
                  <button onClick={changeProfileVisibility} className="bg-[#57aada] hover:bg-[#407da1] text-md text-white px-4 rounded-md shadow-mg
                  transition-all duration-150 [box-shadow:0_3px_0_0_#407da1]
                  border-b-[1px] border-blue-400
                  ">Change Visibility </button>
                </span>
                
              </div>
              <p className="text-gray-600 text-lg dark:text-gray-200 mb-0.5">@{username}</p>
              <p className="mb-3 text-md text-gray-500 dark:text-gray-400">{aboutMe}</p>
              <div className="flex justify-center items-center gap-1">
                <span className="py-1 px-2.5 bg-[#57aada] text-md text-gray-200 dark:text-gray-40 text-center rounded-full">
                <strong>age: {calculateAge(dateOfBirth)}</strong>
                </span>
                <span className="py-1 px-2.5 bg-[#57aada] text-md text-gray-200 dark:text-gray-40 text-center rounded-full"><strong>gender: {gender}</strong></span>
                <span className="py-1 px-2.5 bg-[#57aada] text-md text-gray-200 dark:text-gray-40 text-center rounded-full"><strong>I follow: 1</strong></span>
                <span className="py-1 px-2.5 bg-[#57aada] text-md text-gray-200 dark:text-gray-40 text-center rounded-full"><strong>follow me: 1</strong></span>
              </div>
            </div>
            
          </div>
          <Posts page={"profile"}/>
        </div>
     
  );
};

export default Profile;
