import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { SubmitPost, Tags, Posts } from "./feed/Posts";
import { TopNavigation, ThemeIcon } from "./TopNavigation.jsx";
import { useLocation } from "react-router-dom";
import { Notyf } from "notyf";

const notyf = new Notyf();

const apiURL = process.env.REACT_APP_API_URL;




// const deleteCookie = () => {
//   fetch(`${apiURL}/deleteCookie`, { credentials: "include" })
//     .then((response) => response.text())
//     .then((data) => {
//       // Handle the response from the server
//       console.log("Sending cookie to be deleted:", data);

//       // Redirect to the feed page if the cookie is found
//       if (data === "Cookie is deleted") {
//         console.log("Cookie is deleted from server");

//         // Remove the cookie from the client-side
//         document.cookie = "user_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

//         // Notify the user
//         notyf.success("Logout successful.");

//         // Redirect to the welcome page
//         const navigate = useNavigate();
//         navigate("/");
//       } else {
//         console.log("Cookie is not deleted");
//       }
//     })
//     .catch((error) => {
//       // Handle any errors
//       console.error("Error:", error);
//     });
// };

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
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [profileVisib, setProfileVisib] = useState("public");
  const [isDarkTheme, setDarkTheme] = useState(false);
  const [sPost, setSpost] = useState("");
  const [isHovering, setIsHovering] = useState(null);//to show follower and follow names
  const [hoverData, setHoverData] = useState([]);


  //renders user's list of followers and following
  const handleMouseOver = (id, data) => {
    setIsHovering(id);
    if (data != null){
      setHoverData(data.join(' '));
    } else {
      let info = "Grow your social network 👫"
      setHoverData([info])
    }
    
}

  const handleMouseOut = () => {
    setHoverData([]);
    setIsHovering(false);
  };

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
        console.log("Profile Data:", data);
        setEmail(data.email);
        setUsername(data.username);
        setAboutMe(data.aboutMe);
        setAge(data.age);
        setAvatar(data.avatar);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setFollowers(data.followers)
        setFollowing(data.following)
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

  
  return (

        <div className="modal-overlay min-h-screen bg-gray-100 dark:bg-[#000000b3] py-8" style={{zIndex:988}}>
          <div id="profileCard" className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-24 h-24 border-gradient border-4 border-gray-300 rounded-[50%] overflow-hidden">
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
              <p className="mb-3 text-md text-[#57aada] dark:text-gray-400">{aboutMe}</p>
              <div>
                  <span>
                  <p className="text-gray-400 text-lg dark:text-gray-200 mb-0.5">This Profile is Curently <strong>{profileVisib}</strong></p>
                  <button onClick={changeProfileVisibility} className="bg-gray-400 hover:bg-gray-300 text-md text-white px-4 rounded-md shadow-mg
                  transition-all duration-150 [box-shadow:0_3px_0_0_gray-500]
                  border-b-[1px] border-gray-00] mt-2 mb-4
                  " style={{padding: 8+"px"}}>Change Visibility </button>
                </span>
              </div>
              <div>
              <span className="text-gray-400 text-lg dark:text-gray-200 mb-0.5 mr-3">@{username}</span><span className="text-gray-400 text-lg dark:text-gray-200 mb-0.5 mr-3">{email}</span>
              <span className="text-gray-400 text-lg dark:text-gray-200 mb-0.5 mr-3">
              age: {calculateAge(dateOfBirth)}
                </span>
                <span className="text-gray-400 text-lg dark:text-gray-200 mb-0.5 mr-4">m/f: {gender}</span>
              </div>
              <div className="flex justify-center items-center gap-1">
              <br></br>
              <div className="relative">
  <div className="flex flex-col items-center gap-1">
    <div>
      <span
        id="following:"
        className="py-1 px-2.5 bg-gray-100 text-md text-gray-400 dark:text-white dark:bg-[#57aada] text-center rounded-full mt-2 mr-2 hover:bg-gray-300"
        style={{ cursor: "pointer" }}
        onMouseOver={() => handleMouseOver("following:", following)}
        onMouseOut={handleMouseOut}
      >
        <strong>{following ? following.length : 0} following</strong>
      </span>
      <span
        id="followers:"
        className="py-1 px-2.5 bg-gray-100 text-md text-gray-400 dark:text-white dark:bg-[#57aada] text-center rounded-full mt-2 hover:bg-gray-300"
        style={{ cursor: "pointer" }}
        onMouseOver={() => handleMouseOver("followers:", followers)}
        onMouseOut={handleMouseOut}
      >
        <strong>{followers ? followers.length : 0} followers</strong>
      </span>
    </div>

    {isHovering && (
      <div className="absolute top-full left-0">
      <h2 className="mb-3 text-md text-[#57aada] dark:text-gray-400">
  {Array.isArray(hoverData) ? hoverData : isHovering + ' ' + hoverData}
</h2>


      </div>
    )}
  </div>
</div>

              </div>
            </div>
            
          </div>
          <Posts page={"myProfile"}/>
        </div>
     
  );
};

export default Profile;
