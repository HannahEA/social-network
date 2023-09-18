import React, { useEffect, useRef, useState } from "react";
import { SubmitPost, Tags, Posts } from "./feed/Posts";
import {Chat, AddUserToChatList, PrintNewChat} from "./feed/Chat"
import handleLogout from "./feed/Logout";
import { useWebSocket } from "./WebSocketProvider.jsx";
import { TopNavigation, ThemeIcon } from "./TopNavigation.jsx";
import { useNavigate, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
// import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import Card from "./usersInfo/Card.jsx";
import createCard from "./usersInfo/CreateCard.jsx";
import CreateNotification from "./notifications/createNotification.js";
import Modal from "./usersInfo/Modal.jsx";
import Avatar from "./usersInfo/Avatar.jsx";
import Detail from "./usersInfo/Detail.jsx";
import Alerts from "./notifications/countAlerts.jsx";
import Notification from "./notifications/notification.jsx";
import { Notyf } from "notyf";
import { FunctionsRounded } from "@material-ui/icons";

//Environment variable from the docker-compose.yml file.
//This variable will contain the URL of the backend service,
//allowing the frontend code to make requests to the correct endpoint.
const apiURL = process.env.REACT_APP_API_URL;
//const apiURL = "http://localhost:8000"
 


const Feed = () => {
  const { websocketRef, isWebSocketConnected} = useWebSocket();
  //const{isWebSocketConnected} = useWebSocket()
  //the different kinds of websocket messages
  const allData = useRef({userInfo: {}, chats:[], presences:[], followNotif:{}, followReply:{}, offlineFollowNotif:{}})
  // const [chatData, setChatData] = useState({chats:[], presences:[]})
  useEffect( () => {
  
    if (websocketRef.current) {
      websocketRef.current.onmessage = (e) => {
        // Handle WebSocket messages here
        let message = JSON.parse(e.data)


        if (message.type === "connect") {
          console.log("Entering the 'connect' branch of onmessage")
          allData.current = message;
          
          allData.current.presences = message.presences;
          allData.current.offlineFollowNotif = message.offlineFollowNotif;
          //update pending follow alerts

          showRedDot();

          //update chat user list
          AddUserToChatList({allData: allData.current});


        } else if (message.type == "chat") {
          console.log("chat recieved", message)
          // let chat = message.chat
          PrintNewChat({chat: message.chat})
        } else if (message.type == "followNotif"){
          //send follow notification request to online user
          console.log("follow notification:\n", message.followNotif)
          allData.current.followNotif = message.followNotif
          //update the value of isVisible to 'true'
          showNotification();
          console.log("the isVisible notif flag is:", isVisible)
        }
    };
  }
    if (isWebSocketConnected){

}  
})

  
  const location = useLocation();
  const email = location.state?.email || ""; // Access the passed email
  const userAvatar = location.state?.avatar || ""
  const userInfo = location.state?.userInfo || {}
  const [usersList, setUsersList] = useState([]);
  const [isUsersListVisible, setIsUsersListVisible] = useState(false);
  const usersListRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [redDotVisible, setRedDotVisible] = useState(false);
  allData.current.userInfo = userInfo
 const [isDarkTheme, setDarkTheme] = useState(false); // Example state for isDarkTheme
 // POSTS VARIABLES
  const [Title, setTitle] = useState("");
  const [sPost, setSpost] = useState("");
  const [Content, setContent] = useState("");
  const [Visibility, setVisibility] = useState("");
  const [tag, setTags] = useState([]);
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [imageFile, setImageFile] = useState("");
  const notyf = new Notyf();

  // Function to show the Notification
  const showNotification = () => {
    setIsVisible(true);
  };

    // Function to show the Notification
    const showRedDot = () => {
      setRedDotVisible(true);
    };

  useEffect(() => {
    verifyCookie();

    const handleClick = () => {
      const dropdown = document.querySelector("#dropdown");

      if (dropdown.classList.contains("hidden")) {
        dropdown.classList.remove("hidden");
      } else {
        dropdown.classList.add("hidden");
      }
    };

    const button = document.getElementById("user-menu-button");
    button.addEventListener("click", handleClick);

    // Hide the dropdown div by default
    const dropdown = document.querySelector("#dropdown");
    dropdown.classList.add("hidden");

    return () => {
      button.removeEventListener("click", handleClick);
    };
  }, [sPost]);



// Toggle the visibility of the users list
const handleClickUsersList = () => {
  setIsUsersListVisible(!isUsersListVisible);
  if (!isUsersListVisible == true){

    // Make a GET request that will return all users and their data
  fetch(`${apiURL}/getAllUsers`, {
    
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify(userCookie),
    body: JSON.stringify(email),
    credentials: 'include',
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "All users retrieved ok") {
        console.log({data})
        console.log("the slice of users", data.allUsers);
        setUsersList(data.allUsers);
        
        console.log("the usersList sent to front-end:", usersList);
      } else {
        console.log("could not retrieve all users", data);
      }
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error retrieving all users:", error);
    });
  }
};

//not used
// const handleShowUserInfo = () => {
//  // createCard()

// }

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
   // createCard(selectedUser)
  };



  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalVisible(false);
  };



      const handleFollowUser = () => {
    if (isWebSocketConnected) {

      var influencerUN = selectedUser.username;
      var influencerID = selectedUser.id;
      var influencerVisib = selectedUser.profVisib;
      var followAction
      var logged = selectedUser.loggedIn
      var btnLabel = document.getElementById("follow");

      // var fAction ;

      if (btnLabel.innerHTML === "Follow"){
        followAction = "follow";
        console.log("the followAction is:",followAction);
        btnLabel.innerHTML = "Un-follow"
      }else if(btnLabel.innerHTML == "Un-follow"){
        followAction = "un-follow";
        console.log("the followAction is:",followAction);
        btnLabel.innerHTML = "Follow"
      }


  // request info is sent to the back end
    const followInfo = {
      "type": "followingRequest",
      "followerEmail": email,
      "influencerUN": influencerUN,
      "influencerID": influencerID,
      "influencerVisib": influencerVisib,
      "fAction": followAction,
      "influLogged": logged,
    }
    //this returns correct influencer info
    console.log("printing selectedUser to be sent via websocket for followAction:", selectedUser, followAction)

    websocketRef.current.send(
      JSON.stringify(followInfo)
    )

    // const handleFollowNotif = (notif) => {
    //   createFollowAlert(notif)
    // };



  // Make a POST request to store followInfo into db
  //and handle according to influencer's visibility

  // fetch(`${apiURL}/followRequest`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(followInfo),
  //   credentials: 'include',
  // })
  //   .catch((error) => {
  //     // Handle any errors
  //     console.error("Error sending follow request to db:", error);
  //   });
  

  }
}

  




// ----------------------HANDLE WEBSOCKETS---------------------- 
 
    // const [isWebSocketConnected, setWebSocketConnected] = useState(false);
    // const websocketRef = useRef(null);
    // const allData = useRef({userInfo: userInfo, chats:[], presences:[]})
    
    // useEffect(() => {
    //   console.log("websocket connected", websocketRef.current)
    //   if (!websocketRef.current) {
    //     websocketRef.current = new WebSocket("ws://localhost:8000/websocket");
  
    //     websocketRef.current.onopen = (e) => {
    //       console.log("WebSocket Connection Successfully Opened");
    //       setWebSocketConnected(true);
    //       websocketRef.current.send(

    //         })
    //       );
    //     };
  
    //     websocketRef.current.onmessage = (e) => {
    //       let message = JSON.parse(e.data)
    //       console.log(message)
    //       allData.current.presences = message.presences.clients
    //       console.log(allData.current.prRequest with GET/HEAD method cannot have body.esences)

    //     };

    //     websocketRef.current.onclose = () => {
    //     console.log("websocket connection ended");
    //     setWebSocketConnected(false); // Update the state when the connection is closed
    //     websocketRef.current = null; // Request with GET/HEAD method cannot have body.Reset the ref to null
    //   };
    //   }
  
    //   // return () => {
    //   //   // Close the WebSocket connection only if it was connected
    //   //   if (isWebSocketConnected) {
    //   //     console.log("Websocket connection ended");
    //   //     websocketRef.current.close();
    //   //   }
    //   // };
      
    // }, []);
  
    // Rest of your component code


//--------------UPLOAD AVATAR----------------------
  const handleAvatarChange = (event) => {
    setAvatar(event.target.files[0]);
  };

  const uploadAvatar = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("profilePicture", avatar);
    const email = location.state?.email || ""; // Access the passed email
    const username = "test"; // Replace with the desired username

    // Make a POST request to the server with the username as a query parameter
    // fetch(`${apiURL}/uploadAvatar?username=${username}`, {
    fetch(`${apiURL}/uploadAvatar?username=${username}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        notyf.success("Profile picture uploaded successfully");
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  const verifyCookie = async () => {
    try {
      console.log("entering try");
      const response = await fetch(`${apiURL}/checkCookie`, { credentials: "include" });
      const data = await response.text();

      const dataObj = JSON.parse(data);
      console.log("user avatar and email", dataObj);
      // Redirect user to login page if cookie not found
      if (dataObj.message !== "Cookie is found") {
        console.log(data);
        console.log("Cookie is not found, redirecting to login");
        navigate("/");
        //Otherwise show user avatar and email
      } else {
        console.log("fetching avatar and email");
        let userImage;
        if (dataObj.image != "") {
          userImage = dataObj.image;
        } else if (dataObj.avatar != "" && dataObj.image == "") {
          userImage = dataObj.avatar;
        } else {
          //default avatar image
          console.log("no image found");
          userImage =
            "https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj";
        }
        navigate(`/feed`, { state: { email: dataObj.email, avatar: userImage, userInfo: dataObj} });
      }
    } catch (error) {
      // Handle any errors
      console.error("Error:", error);
    }
  };

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
          notyf.success("Logout successful");
          websocketRef.current.close()
          // closeWebsocket()
          // Redirect to the welcome page
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
//-------------------- POST FUNCTIONS--------------------
  //set New Post Constants
  const handleTitle = (event) => {
    setTitle(event.target.value);
  };
  const handleContent = (event) => {
    setContent(event.target.value);
  };
  const handleVisibility = (event) => {
    setVisibility(event.target.value);
  };
  // const handleTag = (event) => {
  //   setTag(event.target.value);
  // };
  //image upload for posts
  const handlePostImage = (event) => {
    const { value } = event.target;

    if (value.startsWith("http") || value.startsWith("https")) {
      // It's an image URL
      setImageURL(value);
    } else {
      // It's a file upload
      const file = event.target.files[0];

      //now get file type
      /*const fType = file.type;
    console.log({fType});//this should show e.g. "image/jpg"
    fileType = fType.split("/");
    fileType = fileType[1];
    console.log({fileType});*/ //this should show e.g. "jpg"

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setImageFile(result);
      };
      reader.readAsDataURL(file);
      console.log(imageFile);
    }
  };
  // on new post form submission, handle in post file
  const submitPost = async (event) => {
    event.preventDefault();
    let e = document.getElementById("Visibility");
    let v = e.options[e.selectedIndex].text;
    let data = await SubmitPost({ title: Title, content: Content, visibility: v, url: imageURL, file: imageFile, category: tag });
    setSpost(data);
    setTitle("");
    setContent("");
    setTags([]);
    setImageURL(null);
    setImageFile("");
  };
  const addTag = (event) => {
    event.preventDefault();
    let input = document.getElementById("postTags");
    console.log("adding tag");
    console.log("input value", input.value);
    if (input.value != "") {
      setTags([...tag, input.value]);
      console.log(tag);
      input.value = "";
    }
  };

 

  return (
    <div className="antialiased bg-gray-50 dark:bg-gray-900">
      <div className="content-container">{/* <TopNavigation /> */}</div>
      <ThemeIcon isDarkTheme={isDarkTheme} setDarkTheme={setDarkTheme} />
      <nav className="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 fixed left-0 right-0 top-0 z-50">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex justify-start items-center">
            <button
              data-drawer-target="drawer-navigation"
              data-drawer-toggle="drawer-navigation"
              aria-controls="drawer-navigation"
              className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer md:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <svg aria-hidden="true" className="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Toggle sidebar</span>
            </button>
            <div className="content-container flex justify-between mr-7 ml-3">
              <TopNavigation />
            </div>
            <a href="" className="flex items-center justify-between ml-3 mr-3">
              <img src="https://flowbite.s3.amazonaws.com/logo.svg" className="mr-4 h-8" alt="Social-Network Logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Social-Network </span>
            </a>
            <form action="#" method="GET" className="hidden md:block md:pl-2">
              <label htmlFor="topbar-search" className="sr-only">
                Search
              </label>
              <div className="relative md:w-64">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="email"
                  id="topbar-search"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Search"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center lg:order-2">
            <button
              type="button"
              data-drawer-toggle="drawer-navigation"
              aria-controls="drawer-navigation"
              className="p-2 mr-1 text-gray-500 rounded-lg md:hidden hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Toggle search</span>
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                />
              </svg>
            </button>
            {/* Notifications */}
            <div id="notificationsBell">
            <button
              type="button"
              data-dropdown-toggle="notification-dropdown"
              className="p-2 mr-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <span className="sr-only">View notifications</span>
              {/* Bell icon */}
              <svg aria-hidden="true" className="w-6 h-6" position="relative" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <div className="counter" style={{visibility:`${allData.current.offlineFollowNotif.numPending > 0 ? 'visible' : 'hidden'}`}}>
                       {redDotVisible && (
                      <Alerts 
                        setDotVisible={setRedDotVisible}
                        dotVisible={redDotVisible}
                        countFollowNotifs={parseInt(allData.current.offlineFollowNotif.numPending, 10)} 
                        pendingFolNotif={allData.current.offlineFollowNotif.pendingFollows}
                      />
                      )}
            </div> 
         

            </div>
            {/* Dropdown menu */}
            <div
              className="hidden overflow-hidden z-50 my-4 max-w-sm text-base list-none bg-white rounded divide-y divide-gray-100 shadow-lg dark:divide-gray-600 dark:bg-gray-700"
              id="notification-dropdown"
            >
              <div className="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-600 dark:text-gray-300">
                Notifications
              </div>
              <div>
                <a href="#" className="flex py-3 px-4 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600">
                  <div className="flex-shrink-0">
                    <img
                      className="w-11 h-11 rounded-full"
                      src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png"
                      alt="Bonnie Green avatar"
                    />
                    <div className="flex absolute justify-center items-center ml-6 -mt-5 w-5 h-5 rounded-full border border-white bg-primary-700 dark:border-gray-700">
                      <svg
                        aria-hidden="true"
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" />
                        <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="pl-3 w-full">
                    <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                      New message from
                      <span className="font-semibold text-gray-900 dark:text-white">Bonnie Green</span>: "Hey, what's up? All set for the
                      presentation?"
                    </div>
                    <div className="text-xs font-medium text-primary-600 dark:text-primary-500">a few moments ago</div>
                  </div>
                </a>
                <a href="#" className="flex py-3 px-4 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600">
                  <div className="flex-shrink-0">
                    <img
                      className="w-11 h-11 rounded-full"
                      src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png"
                      alt="Jese Leos avatar"
                    />
                    <div className="flex absolute justify-center items-center ml-6 -mt-5 w-5 h-5 bg-gray-900 rounded-full border border-white dark:border-gray-700">
                      <svg
                        aria-hidden="true"
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="pl-3 w-full">
                    <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">Jese leos</span>
                      and
                      <span className="font-medium text-gray-900 dark:text-white">5 others</span>
                      started following you.
                    </div>
                    <div className="text-xs font-medium text-primary-600 dark:text-primary-500">10 minutes ago</div>
                  </div>
                </a>
                <a href="#" className="flex py-3 px-4 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600">
                  <div className="flex-shrink-0">
                    <img
                      className="w-11 h-11 rounded-full"
                      src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/joseph-mcfall.png"
                      alt="Joseph McFall avatar"
                    />
                    <div className="flex absolute justify-center items-center ml-6 -mt-5 w-5 h-5 bg-red-600 rounded-full border border-white dark:border-gray-700">
                      <svg
                        aria-hidden="true"
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="pl-3 w-full">
                    <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">Joseph Mcfall</span>
                      and
                      <span className="font-medium text-gray-900 dark:text-white">141 others</span>
                      love your story. See it and view more stories.
                    </div>
                    <div className="text-xs font-medium text-primary-600 dark:text-primary-500">44 minutes ago</div>
                  </div>
                </a>
                <a href="#" className="flex py-3 px-4 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600">
                  <div className="flex-shrink-0">
                    <img
                      className="w-11 h-11 rounded-full"
                      src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/roberta-casas.png"
                      alt="Roberta Casas image"
                    />
                    <div className="flex absolute justify-center items-center ml-6 -mt-5 w-5 h-5 bg-green-400 rounded-full border border-white dark:border-gray-700">
                      <svg
                        aria-hidden="true"
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="pl-3 w-full">
                    <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">Leslie Livingston</span>
                      mentioned you in a comment:
                      <span className="font-medium text-primary-600 dark:text-primary-500">@bonnie.green</span>
                      what do you say?
                    </div>
                    <div className="text-xs font-medium text-primary-600 dark:text-primary-500">1 hour ago</div>
                  </div>
                </a>
                <a href="#" className="flex py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <div className="flex-shrink-0">
                    <img
                      className="w-11 h-11 rounded-full"
                      src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/robert-brown.png"
                      alt="Robert image"
                    />
                    <div className="flex absolute justify-center items-center ml-6 -mt-5 w-5 h-5 bg-purple-500 rounded-full border border-white dark:border-gray-700">
                      <svg
                        aria-hidden="true"
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                  </div>
                  <div className="pl-3 w-full">
                    <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">Robert Brown</span>
                      posted a new video: Glassmorphism - learn how to implement the new design trend.
                    </div>
                    <div className="text-xs font-medium text-primary-600 dark:text-primary-500">3 hours ago</div>
                  </div>
                </a>
              </div>
              <a
                href="#"
                className="block py-2 text-md font-medium text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:hover:underline"
              >
                <div className="inline-flex items-center">
                  <svg
                    aria-hidden="true"
                    className="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View all
                </div>
              </a>
            </div>
            {/* Apps */}
            <button
              type="button"
              data-dropdown-toggle="apps-dropdown"
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <span className="sr-only">View notifications</span>
              {/* Icon */}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            {/* Dropdown menu */}
            <div
              className="hidden overflow-hidden z-50 my-4 max-w-sm text-base list-none bg-white rounded divide-y divide-gray-100 shadow-lg dark:bg-gray-700 dark:divide-gray-600"
              id="apps-dropdown"
            >
              <div className="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-600 dark:text-gray-300">
                Apps
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                <a href="#" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                  <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-gray-900 dark:text-white">Sales</div>
                </a>
                <a href="#" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                  <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <div className="text-sm text-gray-900 dark:text-white">Users</div>
                </a>
                <a href="#" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                  <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-gray-900 dark:text-white">Inbox</div>
                </a>
                <a href="#" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                  <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-gray-900 dark:text-white">Profile</div>
                </a>
                <a href="#" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                  <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-gray-900 dark:text-white">Settings</div>
                </a>
                <a href="#" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                  <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path
                      fillRule="evenodd"
                      d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-gray-900 dark:text-white">Products</div>
                </a>
                <a href="#" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                  <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-gray-900 dark:text-white">Pricing</div>
                </a>
                <a href="#" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                  <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-gray-900 dark:text-white">Billing</div>
                </a>
                <a href="#" className="block p-4 text-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 group">
                  <svg
                    aria-hidden="true"
                    className="mx-auto mb-1 w-7 h-7 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <div className="text-sm text-gray-900 dark:text-white">Logout</div>
                </a>
              </div>
            </div>
            <button
              type="button"
              className="flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                id="user-menu-button"
              aria-expanded="false"
              data-dropdown-toggle="dropdown"
            >
              <span className="sr-only">Open user menu</span>
              <img
                className={`w-10 h-10 rounded-full border-2 border-solid border-[#57aada] dark:border-white`}
                src={userAvatar}
                alt="user photo"
              />
            </button>
            {/* Dropdown menu */}
            <div
              className="absolute top-[45px] right-0 z-50 my-4 w-56 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
              id="dropdown"
            >
              <div className="py-3 px-4">
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">First Last</span>
                <span className="block text-sm text-gray-900 truncate dark:text-white">{email}</span>
              </div>
              <ul className="py-1 text-gray-700 dark:text-gray-300" aria-labelledby="dropdown">
                <li>
                  <a
                    href="#"
                    className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
                  >
                    My profile
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
                  >
                    Account settings
                  </a>
                </li>
              </ul>
              <ul className="py-1 text-gray-700 dark:text-gray-300" aria-labelledby="dropdown">
                <li>
                  <a
                    href="#"
                    className="flex items-center py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    <svg className="mr-2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    My likes
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    <svg className="mr-2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    My groups
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex justify-between items-center py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    <span className="flex items-center">
                      <svg
                        aria-hidden="true"
                        className="mr-2 w-5 h-5 text-primary-600 dark:text-primary-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Pro version
                    </span>
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </li>
              </ul>
              <ul className="py-1 text-gray-700 dark:text-gray-300" aria-labelledby="dropdown">
                <li onClick={deleteCookie}>
                  <a className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
        aria-label="Sidenav"
        id="drawer-navigation"
      >
        <div className="overflow-y-auto py-5 px-3 h-full bg-white dark:bg-gray-800">
          <form action="#" method="GET" className="md:hidden mb-2">
            <label htmlFor="sidebar-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="sidebar-search"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Search"
              />
            </div>
          </form>
          <ul className="space-y-2">
            <li>
              <a
                href="http://localhost:3000/feed"
              >
              <button
                  type="button"
                  className="flex items-center p-2 w-full text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#57aada] hover:bg-[#4488af] 
                  shadow-lg dark:text-white dark:hover:bg-[#4488af]
                  [box-shadow:0_3px_0_0_#407da1]
                  border-b-[1px] border-blue-400"
                  aria-controls="dropdown-pages"
                  data-collapse-toggle="dropdown-pages"
              >
                  <svg
                    aria-hidden="true"
                    className="flex-shrink-0 w-6 h-6 text-white transition duration-75 group-hover:text-white dark:text-white dark:group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                  <path 
                  fillRule="evenodd" 
                  d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" 
                  clipRule="evenodd"
                  />
                  <path 
                  fillRule="evenodd"  
                  d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" 
                  clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1 ml-3 text-left whitespace-nowrap">Feed</span>
                </button>
              </a>
            </li>
            <li>
              <a href="http://localhost:3000/profile">
                <button
                  type="button"
                  className="flex items-center p-2 w-full text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#57aada] hover:bg-[#4488af] 
                  shadow-lg dark:text-white dark:hover:bg-[#4488af]
                  [box-shadow:0_3px_0_0_#407da1]
                  border-b-[1px] border-blue-400"
                  aria-controls="dropdown-pages"
                  data-collapse-toggle="dropdown-pages"
                >
                  <svg
                    aria-hidden="true"
                    className="flex-shrink-0 w-6 h-6 text-white transition duration-75 group-hover:text-white dark:text-white dark:group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="flex-1 ml-3 text-left whitespace-nowrap">My Profile</span>
                </button>
              </a>
              <ul id="dropdown-pages" className="hidden py-2 space-y-2">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Settings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Kanban
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Calendar
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <button
                type="button"
                className="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                aria-controls="dropdown-sales"
                data-collapse-toggle="dropdown-sales"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1 ml-3 text-left whitespace-nowrap">Posts</span>
                <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <ul id="dropdown-sales" className="hidden py-2 space-y-2">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Billing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Invoice
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <button
                type="button"
                className="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                aria-controls="dropdown-sales"
                data-collapse-toggle="dropdown-sales"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1 ml-3 text-left whitespace-nowrap">Notifications</span>
                <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <ul id="dropdown-sales" className="hidden py-2 space-y-2">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Billing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Invoice
                  </a>
                </li>
              </ul>
            </li>
          </ul>
          <ul className="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" />
                  <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                </svg>
                <span className="flex-1 ml-3 whitespace-nowrap ">Messages</span>
                <span className="inline-flex justify-center items-center w-5 h-5 text-xs font-semibold rounded-full text-primary-800 bg-primary-100 dark:bg-primary-200 dark:text-primary-800">
                  4
                </span>
              </a>
            </li>
            <li>
              <a
                href="javascript:void(0)"
                className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
              >
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <span className="ml-3">Groups</span>
              </a>
            </li>
            <li>
            {/* Start of the drop-down menu for All users except logged-in user */}
          <a
          >
            <button
            onClick={handleClickUsersList}
            type="button"
            className="flex items-center p-2 w-full text-base font-medium text-white 
            rounded-lg transition duration-75 group bg-[#57aada] hover:bg-[#4488af] 
            shadow-lg dark:text-white dark:hover:bg-[#4488af]
            [box-shadow:0_3px_0_0_#407da1]
            border-b-[1px] border-blue-400"
            aria-controls="dropdown-pages"
            data-collapse-toggle="dropdown-pages"
            id="show-users-button"
            >

                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-white group-hover:text-white dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-3" >See All Users</span>
              </button>
            </a>
              {/* Dropdown menu */}
            <div
            // 'ref' makes a link to the element that contains the list of users.
            // Together with conditional css styling it ensures that the element is altered independently
            ref={usersListRef}
              className={`users-list absolute top-[430px] right-4 z-50 my-4 w-56 text-base list-none bg-[#a5dcfc] rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600 ${isUsersListVisible ? 'visible' : 'hidden'}`}
              id="dropdownUsers"
            >
              <ul className="py-0 text-gray-700 dark:text-gray-200">
                  <div
                    className="block py-2 px-4 text-sm hover:bg-[#7ca3ba] dark:hover:bg-[#7096ac] dark:text-gray-600 dark:hover:text-white dark:bg-[#a5dcfc]"
                  >
                    {usersList.map((u)=> (
                      <li key={u.id}>
                       <a onClick={()=>(handleUserClick(u))} style={{cursor: 'pointer'}}> {u.username} - online: {u.loggedIn}</a>
                      </li>
                    ))}
                  </div>
              </ul>
            </div>
            {/* End of the drop-down menu for All users */}

            </li>
                  {/*Start of Modal to display a user's info  */}
     
      {/*End of Modal to display a user's info  */}
          </ul>
        </div>
        <div className="hidden absolute bottom-0 left-0 justify-center p-4 space-x-4 w-full lg:flex bg-white dark:bg-gray-800 z-20">
          <a
            href="#"
            className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
          </a>
          <a
            href="#"
            data-tooltip-target="tooltip-settings"
            className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400 dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          <div
            id="tooltip-settings"
            role="tooltip"
            className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
          >
            Settings page
            <div className="tooltip-arrow" data-popper-arrow="" />
          </div>
          <button
            type="button"
            data-dropdown-toggle="language-dropdown"
            className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:hover:text-white dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5 rounded-full mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 3900 3900"
            >
              <path fill="#b22234" d="M0 0h7410v3900H0z" />
              <path d="M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0" stroke="#fff" strokeWidth={300} />
              <path fill="#3c3b6e" d="M0 0h2964v2100H0z" />
              <g fill="#fff">
                <g id="d">
                  <g id="c">
                    <g id="e">
                      <g id="b">
                        <path id="a" d="M247 90l70.534 217.082-184.66-134.164h228.253L176.466 307.082z" />
                        <use xlinkHref="#a" y={420} />
                        <use xlinkHref="#a" y={840} />
                        <use xlinkHref="#a" y={1260} />
                      </g>
                      <use xlinkHref="#a" y={1680} />
                    </g>
                    <use xlinkHref="#b" x={247} y={210} />
                  </g>
                  <use xlinkHref="#c" x={494} />
                </g>
                <use xlinkHref="#d" x={988} />
                <use xlinkHref="#c" x={1976} />
                <use xlinkHref="#e" x={2470} />
              </g>
            </svg>
          </button>
          {/* Dropdown */}
          <div
            className="hidden z-50 my-4 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700"
            id="language-dropdown"
          >
            <ul className="py-1" role="none">
              <li>
                <a
                  href="#"
                  className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600"
                  role="menuitem"
                >
                  <div className="inline-flex items-center">
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5 rounded-full mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      id="flag-icon-css-us"
                      viewBox="0 0 512 512"
                    >
                      <g fillRule="evenodd">
                        <g strokeWidth="1pt">
                          <path
                            fill="#bd3d44"
                            d="M0 0h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0z"
                            transform="scale(3.9385)"
                          />
                          <path
                            fill="#fff"
                            d="M0 10h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0z"
                            transform="scale(3.9385)"
                          />
                        </g>
                        <path fill="#192f5d" d="M0 0h98.8v70H0z" transform="scale(3.9385)" />
                        <path
                          fill="#fff"
                          d="M8.2 3l1 2.8HAth8na2Win2L9.7 7.5l.9 2.7-2.4-1.7L6 10.2l.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8H45l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7L74 8.5l-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9L92 7.5l1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm-74.1 7l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7H65zm16.4 0l1 2.8H86l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm-74 7l.8 2.8h3l-2.4 1.7.9 2.7-2.4-1.7L6 24.2l.9-2.7-2.4-1.7h3zm16.4 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8H45l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9L92 21.5l1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm-74.1 7l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7H65zm16.4 0l1 2.8H86l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm-74 7l.8 2.8h3l-2.4 1.7.9 2.7-2.4-1.7L6 38.2l.9-2.7-2.4-1.7h3zm16.4 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8H45l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9L92 35.5l1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm-74.1 7l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7H65zm16.4 0l1 2.8H86l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm-74 7l.8 2.8h3l-2.4 1.7.9 2.7-2.4-1.7L6 52.2l.9-2.7-2.4-1.7h3zm16.4 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8H45l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9L92 49.5l1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm-74.1 7l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7H65zm16.4 0l1 2.8H86l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm-74 7l.8 2.8h3l-2.4 1.7.9 2.7-2.4-1.7L6 66.2l.9-2.7-2.4-1.7h3zm16.4 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8H45l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9L92 63.5l1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9z"
                          transform="scale(3.9385)"
                        />
                      </g>
                    </svg>
                    English (US)
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600"
                  role="menuitem"
                >
                  <div className="inline-flex items-center">
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5 rounded-full mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      id="flag-icon-css-de"
                      viewBox="0 0 512 512"
                    >
                      <path fill="#ffce00" d="M0 341.3h512V512H0z" />
                      <path d="M0 0h512v170.7H0z" />
                      <path fill="#d00" d="M0 170.7h512v170.6H0z" />
                    </svg>
                    Deutsch
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600"
                  role="menuitem"
                >
                  <div className="inline-flex items-center">
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5 rounded-full mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      id="flag-icon-css-it"
                      viewBox="0 0 512 512"
                    >
                      <g fillRule="evenodd" strokeWidth="1pt">
                        <path fill="#fff" d="M0 0h512v512H0z" />
                        <path fill="#009246" d="M0 0h170.7v512H0z" />
                        <path fill="#ce2b37" d="M341.3 0H512v512H341.3z" />
                      </g>
                    </svg>
                    Italiano
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600"
                  role="menuitem"
                >
                  <div className="inline-flex items-center">
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5 rounded-full mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      id="flag-icon-css-cn"
                      viewBox="0 0 512 512"
                    >
                      <defs>
                        <path id="a" fill="#ffde00" d="M1-.3L-.7.8 0-1 .6.8-1-.3z" />
                      </defs>
                      <path fill="#de2910" d="M0 0h512v512H0z" />
                      <use width={30} height={20} transform="matrix(76.8 0 0 76.8 128 128)" xlinkHref="#a" />
                      <use width={30} height={20} transform="rotate(-121 142.6 -47) scale(25.5827)" xlinkHref="#a" />
                      <use width={30} height={20} transform="rotate(-98.1 198 -82) scale(25.6)" xlinkHref="#a" />
                      <use width={30} height={20} transform="rotate(-74 272.4 -114) scale(25.6137)" xlinkHref="#a" />
                      <use width={30} height={20} transform="matrix(16 -19.968 19.968 16 256 230.4)" xlinkHref="#a" />
                    </svg>
                    中文 (繁體)
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>
      <main className="p-4 pb-[8rem] md:ml-64 h-auto pt-20">
        <Chat websocketRef={websocketRef} isWebSocketConnected={ isWebSocketConnected} allData={allData}/>
        <h1 className="text-black dark:text-white" >Profile Picture Upload</h1>
        <form className="text-black dark:text-white" id="uploadForm" encType="multipart/form-data">
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          <button className="text-black dark:text-white" type="submit" onClick={uploadAvatar}>
            Upload
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="  dark:bg-gray-900 dark:text-white profile-info flex flex-row gap-4 md:gap-0 md:flex-col justify-center items-center border-2 border-dashed bg-white border-gray-300 rounded-lg dark:border-gray-600 h-32 md:h-64">
            <img
              //className="w-16 h-16 mb-2 rounded-full border-2 border-solid border-white-500"
              className={`w-16 h-16 rounded-full border-2 border-solid border-[#57aada] dark:border-[#f8fafc]`}
              //src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/michael-gough.png"
              src={userAvatar}
              alt="user photo"
            />
            <div className="flex justify-center items-center flex-col">
              <p>Followers: 0</p>
              <p>Posts: 0</p>
              <p>Email: {email}</p>
            </div>
          </div>
        {/* Start of follow notification */}
          {/* removed, invoked in line 26: onClick={() => {CreateNotification(allData.current.followNotif.notifMsg, allData.current.followNotif.followID) ()}} */}
          <div id="showNotif" className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64" >
          {isVisible && (
          <Notification 
            setIsVisible={setIsVisible}
            notifVisible={isVisible}
            message={allData.current.followNotif.notifMsg}
            ID={allData.current.followNotif.followID}
          />
          )}
          
        {/* End of follow notification */}

        {/* Start of users Information modal */}
        {isModalVisible && (
        <Modal 
        onClose={() => {handleCloseModal()}} 
        onFollow={() => {handleFollowUser()}}
        influencer={parseInt(selectedUser.influencer, 10)} // Pass the influencer prop here
        >
          {selectedUser && (
            <Card
              name={selectedUser.username}
              avt={selectedUser.avatar}
              img={selectedUser.image}
              visib={selectedUser.profVisib}
              influencer= {parseInt(selectedUser.influencer, 10)}
              about={selectedUser.aboutMe}
            />
          )}
        </Modal>
      )}
      </div>
        {/* End of users Information modal */}
          
          <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64" />
          <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64" />
        </div>
        <div
          id="submitPosts"
          className="bg-white border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-96 dark:bg-gray-800 mb-4"
        >
          <div className="  dark:bg-gray-800 dark:text-white flex justify-left items-left flex-col">
            <h3 className="pl-5 mt-3 font-bold text-xl text-[#5aadde]  ">Update Feed</h3>
            <form onSubmit={submitPost}>
              <span className="flex p-2.5 pl-5">
                <p className="flex-row mr-5 font-bold text-[#5aadde]">Title</p>
                <input
                  className="flex-row border-b-2 border-green shadow-md dark:bg-gray-800 dark:text-white focus:outline-none"
                  type="text"
                  value={Title}
                  onChange={handleTitle}
                />
              </span>

              <span className="flex p-2.5 pl-5">
                <p className="flex-row mr-5 font-bold text-[#5aadde]">Tags</p>
                <input
                  type="text"
                  id="postTags"
                  className="flex-row mr-5 border-b-2 border-green shadow-md dark:bg-gray-800 dark:text-white focus:outline-none"
                />
                <button
                  onClick={addTag}
                  type="submit"
                  value="Add Tag"
                  className="flex-row pl-2  pr-2 font-bold bg-[#8cc0de] text-sm text-white rounded-md cursor-pointer hover:bg-[#76a1ba] shadow-lg"
                >
                  Add Tag
                </button>
              </span>
              <Tags tags={tag} />
              <div className="flex justify-right items-right flex-col">
                <p className="p-2.5 pl-5 font-bold text-[#5aadde]">Content</p>
                <textarea
                  className="m-5 mt-0 mb-2.5 mlength-10 border-b-2 shadow-md border-green dark:bg-gray-800 dark:text-white focus:outline-none"
                  name="postContent"
                  id="postContent"
                  cols="8"
                  rows="3"
                  maxLength="100"
                  value={Content}
                  onChange={handleContent}
                ></textarea>
              </div>

              <select
                className="ml-5 pl-5 font-bold focus:outline-none dark:bg-gray-800 text-[#5aadde]"
                name="Visibility"
                id="Visibility"
                onChange={handleVisibility}
              >
                <option name="public" value={Visibility} className="text-[#5aadde]">
                  Public
                </option>
                <option name="private" value={Visibility}>
                  Private
                </option>
              </select>
              <div className="flex">
                <input
                  type="text"
                  name="imageUrl"
                  id="imageUrl"
                  placeholder="Enter image URL"
                  className="ml-5 m-2.5 pl-5 pr-5 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-gray-600 dark:bg-gray-800 dark:text-white"
                  // value={imageURL}
                  onChange={handlePostImage}
                />
                <label
                  htmlFor="imageFile"
                  className="ml-5 m-2.5 pl-5 pr-5  items-center justify-center text-sm font-bold bg-[#8cc0de] text-white border border-transparent rounded-lg cursor-pointer hover:bg-[#76a1ba] shadow-lg"
                >
                  Upload Image File
                </label>
                {/* <input type="file" name="imageFile" id="imageFile" accept="image/*" className="hidden" value={imageFile} onChange={handlePostImage} /> */}
                <input type="file" name="mageFile" id="imageFile" accept="image/*" className="hidden" onChange={handlePostImage} />
              </div>
              <button className="ml-5 m-2.5 pl-5 pr-5 font-bold bg-[#57aada] cursor-pointer hover:bg-[#3a7597] text-white rounded-md shadow-lg" type="submit ">
                Post
              </button>
            </form>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800">
          <Posts sPost={sPost} />
        </div>
      </main>
    </div>
  );
};



export default Feed;
