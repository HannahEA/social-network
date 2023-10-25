import React, { useEffect, useRef, useState } from "react";
import { SubmitPost, Tags, Posts } from "./feed/Posts";
import {Chat, AddUserToChatList, PrintNewChat, RequestChatNotification, ChangeChatNotification, ChangeMessageNotification} from "./feed/Chat"
import { useWebSocket } from "./WebSocketProvider.jsx";
import { TopNavigation, ThemeIcon } from "./TopNavigation.jsx";
import  Profile  from "./Profile.jsx"
import { useNavigate, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
// import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import GroupsModal from "./groups/groupsModal.jsx";
import Card from "./usersInfo/Card.jsx";
import Modal from "./usersInfo/Modal.jsx";
import Avatar from "./usersInfo/Avatar.jsx";
import Detail from "./usersInfo/Detail.jsx";
import Alerts from "./notifications/countAlerts.jsx";
import Notification from "./notifications/notification.jsx";
import NewGroupNotification from "./groups/newGroupNotification.jsx";
import JoinGpReq from "./groups/joinGpReq.jsx"
import GroupProfile from "./groups/groupProfile.jsx";
import GrProfileCard from "./groups/grProfileCard.jsx"
import { Notyf } from "notyf";
// import { FunctionsRounded } from "@material-ui/icons";



//Environment variable from the docker-compose.yml file.
//This variable will contain the URL of the backend service,
//allowing the frontend code to make requests to the correct endpoint.
const apiURL = process.env.REACT_APP_API_URL;
//const apiURL = "http://localhost:8000"
 


const Feed = () => {
  const { websocketRef, isWebSocketConnected} = useWebSocket();
  //const{isWebSocketConnected} = useWebSocket()
  //the different kinds of websocket messages
  const allData = useRef({userInfo: {}, chats:[], presences:[], followNotif:{}, followReply:{}, offlineFollowNotif:{}, newGroupNotif:{}, offlineGroupInvites:{}, sendAllGroups:{}, oneJoinGroupRequest:{}, offlineJoinGroupRequests:{} })
  // const [chatData, setChatData] = useState({chats:[], presences:[]})
  useEffect( () => {
  
    if (websocketRef.current) {
      websocketRef.current.onmessage = (e) => {
        // Handle WebSocket messages here
        let message = JSON.parse(e.data)
        console.log(message, "web message")
        if (message.type == "connect") {
           console.log("the entire message is: ", message)
          allData.current.presences = message.presences
          allData.current.offlineFollowNotif = message.offlineFollowNotif
          allData.current.offlineGroupInvites = message.offlineGroupInvites
          allData.current.offlineJoinGroupRequests = message.offlineJoinGroupRequests

          //to prevent getting 'undefined' when there are no notifications
          let numFollowPending = parseInt(allData.current.offlineFollowNotif.numFollowPending, 10) || 0;
          let numGroupPending =  parseInt(allData.current.offlineGroupInvites.numGrpsPending, 10) || 0;
          let numJoinGroupPending = parseInt(allData.current.offlineJoinGroupRequests.numGrpsPending, 10) || 0;
          //all pending alerts is the sum of the above
          let allNotifications = numFollowPending + numGroupPending + numJoinGroupPending
          console.log("all notifications are: ", allNotifications)
          //check if there are pending follow notifs or group invites
          if (allNotifications > 0) {
            console.log("notifications count: ", allData.current.offlineFollowNotif.numFollowPending)
            console.log("new groups count: ", allData.current.offlineGroupInvites.numGrpsPending)
            console.log("new join groups count: ", allData.current.offlineJoinGroupRequests.numGrpsPending)
            //if yes, display the red alert
            showRedDot();
            //change corresponding state variables
            if (numFollowPending > 0){
              setPendingNotif(allData.current.offlineFollowNotif.pendingFollows);
            }
            if (numGroupPending > 0){
              setPendingGroups(allData.current.offlineGroupInvites.pendingGroupInvites);
            }
            if(numJoinGroupPending > 0){
              setPendingJoinGroups(allData.current.offlineJoinGroupRequests.offlineJoinGrRequests)
            }

          }else{
           console.log("numPending is zero, Nan or undefined", allData.current.offlineFollowNotif.numPending);
           hideRedDot();
           let aDiv = document.querySelector("#aCounter");
           hideRedDot()
           aDiv.style.visibility = "hidden";
          }
          
          
          //update chat user list
          console.log("message type", message.type)
          AddUserToChatList({type: message.type, allData: allData.current})
          //chat notifications 
         if (message.presences.clients) {
          for (const user of message.presences.clients) {
            console.log("no. of chats", user)
            if (user[2] != '0') {
              ChangeChatNotification({ usernames:message.presences.clients})
              ChangeMessageNotification({chat: message.chat})
              break
            }
          }
         }
          
         
        } else if (message.type == "user update") {
          console.log("message type", message.type)
          allData.current.presences = message.presences
          AddUserToChatList({type: message.type, allData: allData.current})
        }else if (message.type == "chat") {
          console.log("chat recieved", message)
          //check which chat is open in the chatbox by checking the chats div name which should be the converstion id
          let chatId = document.getElementById('chats').getAttribute('name')
          console.log(chatId, " chatId")
          if (message.chat.chatID == chatId) {
            console.log("printing chat")
            // if the converstion id of the chat matches the open chat, then print the chat
            PrintNewChat({chat: message.chat})
          } else {
            // post request- add chat notification to db server side
            RequestChatNotification({chat: message.chat})
            // add notification icon to the relevant chat or to the messages button
            console.log("add notif icon")
            let chatBox = document.getElementById("chatOpen")
            if (chatBox.style.display != "flex") {
              console.log("chat box is not open", chatBox.display)
              ChangeMessageNotification({chat: message.chat}) 
            }
              ChangeChatNotification({usernames:[[message.chat.username]]})
            } 
          } else if (message.type == "followNotif"){
          //send follow notification request to online user
          console.log("follow notification:\n", message.followNotif)
          allData.current.followNotif = message.followNotif
          //update the value of isVisible to 'true'
          showNotification();
          console.log("the isVisible notif flag is:", isVisible)
        } else if (message.type == "newGroupNotif"){
          allData.current.newGroupNotif = message.newGroupNotif
          showGroupInvites();
          console.log("newGroupNotif received by member: ", allData.current.newGroupNotif)
        } else if (message.type == "sendAllGroups"){
            
            allData.current.sendAllGroups = message.sendAllGroups
          //update the state variable 'setGroupsList'
            setGroupsList((prevState) => ({
              ...prevState,
              requestor: allData.current.sendAllGroups.requestor,
              nbGroups: allData.current.sendAllGroups.nbGroups,
              sliceOfGroups: allData.current.sendAllGroups.sliceOfGroups,
              type: allData.current.sendAllGroups.type
            }
            )
          )
            setRequestBy(allData.current.sendAllGroups.requestor) 
        }else if (message.type == "oneJoinGroupRequest"){
          //send join group request to group creator
          allData.current.oneJoinGroupRequest = message.oneJoinGroupRequest
          showJoinGroupRequests();
          console.log("The requestToJoinGroup data: ", allData.current.oneJoinGroupRequest)
        }
    };
  }
    if (isWebSocketConnected){

}  
})

// const hideRedDot = () => {
//   setRedDotVisible(false)
// }
  const location = useLocation();
  const email = location.state?.email || ""; // Access the passed email
  const userAvatar = location.state?.avatar || ""
  const userInfo = location.state?.userInfo || {}
  // const offlineFollowNotif = location.state?.offlineFollowNotif || {}
  const [usersList, setUsersList] = useState([]);
  const [isUsersListVisible, setIsUsersListVisible] = useState(false);
  const usersListRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGroupProfileVisible, setGroupProfileVisible] = useState(false);
  const [groupMember, setGroupMember] = useState(false)
  const [groupsModalVisible, setGroupsModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const[isGroupsVisible, setIsGroupsVisible] = useState(false);
  const [isJoinGroupVisible, setIsJoinGroupVisible] = useState(false);
  const [redDotVisible, setRedDotVisible] = useState(false);
  const[isPendingListVisible, setIsPendingListVisible] = useState(false);
  const[pendingNotif, setPendingNotif] = useState([]);
  const[pendingGroups, setPendingGroups] = useState([]);
  const[pendingJoinGroups, setPendingJoinGroups] = useState([]);
  const[groupsList, setGroupsList] = useState({
    requestor: "",
    nbGroups: "",
    sliceOfGroups: [],
    type: ""
  })
  const [selectedGroup, setSelectedGroup] = useState({
    id: "",
    creator: "",
    gpMembers: [],
    grpDescr: "",
    grpName: "",
    type: ""
  });
  const [requestBy, setRequestBy] = useState("");
  const [greenDotVisible, setGreenDotVisible] = useState(false);
  allData.current.userInfo = userInfo
  // allData.current.offlineFollowNotif = offlineFollowNotif
 const [isDarkTheme, setDarkTheme] = useState(false); // Example state for isDarkTheme
 // POSTS VARIABLES
  const [Title, setTitle] = useState("");
  const [sPost, setSpost] = useState("");
  const [Content, setContent] = useState("");
  const [Visibility, setVisibility] = useState("");
  const [postViewers, setPostViewers] = useState([])
  const [tag, setTags] = useState([]);
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [imageFile, setImageFile] = useState("");
  const notyf = new Notyf();

  // Function to show Notifications for online users
  const showNotification = () => {
    setIsVisible(true);
  };

  // Function to show Notifications for online users
  const showGroupInvites = () => {
    setIsGroupsVisible(true);
  };

  // Function to show join group request notifications for online group creators
  const showJoinGroupRequests = () => {
    setIsJoinGroupVisible(true);
  };

    // Function to show the offline Notifications
    const showRedDot = () => {
      setRedDotVisible(true);
    };

    // Function to show the Notification
    const hideRedDot = () => {
        setRedDotVisible(false);
    };

    //Toggle visibility of the list of pending notifications
const togglePendingListVisible = () => {
  setIsPendingListVisible(!isPendingListVisible);
}

const handleOfflFollowAccept = (f) => {
  console.log("Offline user", f.influencerUN ,"has accepted follow request from", f.followerUN,". The follow ID is: ",f.followID)
  let ID = f.followID.toString();
  let reply = "Yes";
  // Make a reply object
  var YesNo = {
      "followID": ID,
      "followReply": reply,
      "type": "followReply",
  };

  console.log("the followReply sent to back end: ", YesNo)

  //send reply object to back end
  websocketRef.current.send(
    JSON.stringify(YesNo)
  )
  
  //remove the offline follow request item from drop-down list
  document.getElementById(ID).innerHTML = '';
}

const handleOfflFollowDecline = (f) => {
  console.log("Offline user", f.influencerUN ,"has declined follow request from", f.followerUN,". The follow ID is: ",f.followID)
  let ID = f.followID.toString();
  let reply = "No";
    // Make a reply object
    var YesNo = {
        "followID": ID,
        "followReply": reply,
        "type": "followReply",
    };

    console.log("the followReply sent to back end: ", YesNo)

    //send reply object to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )

  //remove the offline follow request item from drop-down list
  document.getElementById(ID).innerHTML = '';
}

//send user's group invite reply to back end (= Yes)
const handleOfflGroupAccept = (g) => {
  console.log("Offline user", g.member ,"has accepted group invite from", g.creator,". The group ID is: ",g.grpID)
  let ID = g.grpID.toString();
  let reply = "Yes";
  // Make a reply object
  var YesNo = {
      "grpID": ID,
      "groupMember": g.member,
      "joinReply": reply,
      "type": "joinGroupReply",
  };

  console.log("the followReply sent to back end: ", YesNo)

  //send reply object to back end
  websocketRef.current.send(
    JSON.stringify(YesNo)
  )
  
  //remove the offline follow request item from drop-down list
  document.getElementById(ID).innerHTML = '';
}

//send user's group invite reply to back end (= No)
const handleOfflGroupDecline = (g) => {
  console.log("Offline user", g.member ,"has declined group invite from", g.creator,". The group ID is: ",g.grpID)
  let ID = g.grpID.toString();
  let reply = "No";
  // Make a reply object
  var YesNo = {
      "grpID": ID,
      "groupMember": g.member,
      "joinReply": reply,
      "type": "joinGroupReply",
  };

  console.log("the followReply sent to back end: ", YesNo)

  //send reply object to back end
  websocketRef.current.send(
    JSON.stringify(YesNo)
  )
  
  //remove the offline follow request item from drop-down list
  document.getElementById(ID).innerHTML = '';
}


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

//display the groups modal
 const handleGroupsClick = () => {
      setGroupsModalVisible(true);
      //send request to b.e. to get back a list of existing groups
      let getGroups = {"usrEmail": email, "type": "getGroups",}
      console.log("printing getGroups to be sent via websocket: ", getGroups)
      websocketRef.current.send(
        JSON.stringify(getGroups)
      )

 }

 //hide the groups modal
 const handleGroupsClose = () => {
      setGroupsModalVisible(false);
 };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };



  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalVisible(false);
  };

  const handleGpCloseModal = () => {
    setGroupProfileVisible(false);
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

  


// OPEN PROFILE

const [viewProfile, setViewProfile] = useState(false)
  const openProfile = () => {
   

    setViewProfile(true) 
    let main = document.querySelector('main')
    let length = main.children.length

    console.log("main child", main.children)
    for (let i = 0; i<length; i++) {
      console.log(i)
      if (i>1){
        console.log("what i'm removing", main.children[2] )
        let child = main.childNodes[2]
        child.remove()
      } 
    }
  }



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
      allData.current.followers = dataObj.followers
      allData.current.following = dataObj.following
      console.log("allDAta", allData)
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
    let e = event.target 
    setVisibility(e.options[e.selectedIndex].text);
  };

  const handlePostViewers = (event) => {
    let i = postViewers.indexOf(event.target.name)
    if ( i > -1) {
      let v = postViewers
      v.splice(i, 1)
      setPostViewers( v)
    } else {
      setPostViewers([...postViewers, event.target.name])
    } 
  }
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
    let data = await SubmitPost({ title: Title, content: Content, visibility: v, url: imageURL, file: imageFile, category: tag , postViewers: postViewers});
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
      <nav className="bg-white border-b border-gray-200 px-4 dark:bg-gray-800 dark:border-gray-700 fixed left-0 right-0 top-0 z-50">
        <div className="flex flex-wrap justify-between items-center" id="bellDotsAvatar">
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
                <div className="flex items-center pl-3 pointer-events-none">
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
          <div className="flex items-center static lg:order-2">
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
              onCick={togglePendingListVisible}
              type="button"
              data-dropdown-toggle="notification-dropdown"
              className="p-2 mr-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <span className="sr-only">View notifications</span>
              {/* Bell icon */}
              <svg aria-hidden="true" className="w-6 h-6" position="absolute" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            {/* {console.log("the numPending :====>",allData)} */}
            {/* <div className="counter" style={{visibility:`${parseInt(allData.current.offlineFollowNotif.numPending, 10) > 0 ? 'visible' : 'hidden'}`}}> */}
            <div className="counter" id="aCounter">
            <button onClick={togglePendingListVisible} id="offlineNotifBtn">
                       {redDotVisible && (
                      <Alerts 
                        setDotVisible={setRedDotVisible}
                        dotVisible={redDotVisible}
                        countFollowNotifs={(parseInt(allData.current.offlineFollowNotif.numFollowPending, 10)||0) + (parseInt(allData.current.offlineGroupInvites.numGrpsPending, 10)||0) + (parseInt(allData.current.offlineJoinGroupRequests.numGrpsPending, 10) ||0)}
                        pendingFolNotif={allData.current.offlineFollowNotif.pendingFollows}
                        pendingGroupInvites={allData.current.offlineGroupInvites}
                        pendingJoinGroups={allData.current.offlineJoinGroupRequests}
                      />
                      )}
            {console.log("follows inside alerts div",allData.current.offlineFollowNotif.numPending)}
            {console.log("group invites inside alerts div",allData.current.offlineGroupInvites)}
            {console.log("join group requests pending: ",allData.current.offlineJoinGroupRequests)}
            </button>
            </div> 
         

            </div>
          {/* offline dropdown list moved to id="offlineNotif" */}

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
              {/* <a href="http://localhost:3000/profile"> */}
              <a href="javascript:;">
                <button
                  type="button"
                  className="flex items-center p-2 w-full text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#57aada] hover:bg-[#4488af] 
                  shadow-lg dark:text-white dark:hover:bg-[#4488af]
                  [box-shadow:0_3px_0_0_#407da1]
                  border-b-[1px] border-blue-400"
                  aria-controls="dropdown-pages"
                  data-collapse-toggle="dropdown-pages"
                  onClick = {openProfile}
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
              <a>
              <button
                onClick={()=>(handleGroupsClick())}
                className="flex items-center p-2 w-full text-base font-medium text-white 
                rounded-lg transition duration-75 group bg-[#57aada] hover:bg-[#4488af] 
                shadow-lg dark:text-white dark:hover:bg-[#4488af]
                [box-shadow:0_3px_0_0_#407da1]
                border-b-[1px] border-blue-400"
                id="show-groups-button">
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-white group-hover:text-white dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <span className="ml-3">Groups</span>
                </button>
              </a>
            </li>
            <li>
            {/* Start of the drop-down menu for All users except logged-in user */}
            <a>
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
        {viewProfile&& <Profile/>}
        <div></div>
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
          {/* Start of new group notification */}
          <div id="showGroupNotif" className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64" >
         {console.log("the state variable of groupVisible: ", isGroupsVisible)}
          {isGroupsVisible && (
          <NewGroupNotification 
            setGroupsVisible={setIsGroupsVisible}
            grNotifVisible={isGroupsVisible}
            groupData={allData.current.newGroupNotif}
          />
          )}
          </div>
        {/* End of new group notification */}

        {/* Start of join group request notification */}
          <div id="joinGpReq" className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64" >
          {console.log("the state variable of isJoinGroupVisible: ", isJoinGroupVisible)}
          {isJoinGroupVisible && (
            <JoinGpReq 
              setJoinGpVisible={setIsJoinGroupVisible}
              joinGrVisible={isJoinGroupVisible}
              joinRequest={allData.current.oneJoinGroupRequest}
            />
          )}
          </div>
        {/* End of join group request notification */}



        {/* Start of follow notification */}
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
        user = {selectedUser}
        >
          {selectedUser && (
            <Card
            user = {selectedUser}
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


        {/* Start of GroupProfile */}
        {(isGroupProfileVisible && requestBy)&& (
        <GroupProfile 
        grpMember={groupMember}
        onGpClose={() => {handleGpCloseModal()}} 
        onShowGroup={() => {handleGpCloseModal()}}
        followers={allData.current.followers}
        request={requestBy}
        theGroup={selectedGroup}
        >
          {selectedGroup && (
            <GrProfileCard
              setGrp={setSelectedGroup}
              theGroup={selectedGroup}
            />
          )}
        </GroupProfile>
      )}

       {/* End of GroupProfile */}

     {/* Start of show groupsModal*/}
          
      <div id="showGroups" className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64" >
    {groupsModalVisible && (console.log("the allData in feed: ", allData.current))}
      {(groupsModalVisible && groupsList && requestBy) && (
        <GroupsModal 
        onClose={() => {handleGroupsClose()}} 
        setGrpProfileVisible={setGroupProfileVisible}
        setGrp={setSelectedGroup}
        grpProfileVisible={isGroupProfileVisible}
        setGrpMember={setGroupMember}
        grpMember={groupMember}
        followers={allData.current.followers}
        creator={email}
        request={requestBy}
        allGroups={groupsList}
        >
        </GroupsModal>
      )}
      </div>
      {/* End of show groupsModal */}
          
      <div className="relative border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-32 md:h-64" id="offlineNotif">
              {/*Start of offline Notifications Dropdown menu */}
      <div
          className={`top-10 overflow-hidden z-50 my-4 max-w-sm text-base list-none bg-white rounded divide-y divide-gray-100 shadow-lg dark:divide-gray-600 dark:bg-gray-700 ${isPendingListVisible ? 'visible' : 'hidden'}`}
                
          id="notification-dropdown"
            >
    {/* Start of follow notifs offline */}
    <div className="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-600 dark:text-gray-300" id="offlineFollowsTitle">
                Follow Requests
    </div>
              <ul className="py-0 text-gray-700 dark:text-gray-200" id="offlineFollowsUL">
                  <div
                    className="block py-2 px-4 text-sm hover:bg-[#7ca3ba] dark:hover:bg-[#7096ac] dark:text-gray-600 dark:hover:text-white dark:bg-[#a5dcfc]"
                  >
                    {pendingNotif.map((f)=> (
                      <li key={f.followID} id={f.followID} >
                       <a href="#" className="flex py-3 px-4 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600">
                      <div className="flex-shrink-0">
                      <img
                        className="w-11 h-11 rounded-full"
                        // src={(f.followerURL).substring(0,3)==="" && (f.followerImage).substring(0.3)==="" ? "https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj" :(f.followerURL).substring(0,3)==="htt" ? f.followerURL : f.followerImage}
                        src={f.followerURL || f.followerImage || "https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj"}
                        alt="follower"
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
                        <span className="font-semibold text-gray-900 dark:text-white">{f.followerUN} </span>
                          started following you.
                      </div>
                      </div>
                    </a>
                    <div className="text-xs font-medium text-primary-600 dark:text-primary-500">                  
                        <a onClick={()=>(handleOfflFollowAccept(f))} style={{cursor: 'pointer'}} class="offlineAccept">Accept</a>
                        <a onClick={()=>(handleOfflFollowDecline(f))} style={{cursor: 'pointer'}} class="offineDecline"> Decline</a>
                    </div>
                    </li>
                    ))}
                  </div>
              </ul>
    {/* End of offline follow notifs */}
                    
    {/* Start of group invites offline notif */}
    <div className="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-600 dark:text-gray-300" id="offlGroupInvitesTitle">
                Group Invites
    </div>
    <ul className="py-0 text-gray-700 dark:text-gray-200" id="offlineGrpInvitesUL">
                  <div
                    className="block py-2 px-4 text-sm hover:bg-[#7ca3ba] dark:hover:bg-[#7096ac] dark:text-gray-600 dark:hover:text-white dark:bg-[#a5dcfc]"
                  >
                  {console.log("the pendingGroups from feed", pendingGroups)}
                    {pendingGroups.map((g)=> (
                      <li key={g.grpID} id={g.grpID} >
                       <a href="#" className="flex py-3 px-4 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600">
                      <div className="flex-shrink-0">
                      <img
                        className="w-11 h-11 rounded-full"
                        src={g.creatorURL || g.creatorImage || "https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj"}
                        alt="groupInvite"
                      />
                      <div className="flex absolute justify-center items-center ml-6 -mt-5 w-5 h-5 bg-gray-900 rounded-full border border-white dark:border-gray-700">
                        <svg
                          aria-hidden="true"
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 19"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                        <path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z" />
                        <path d="M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h-.424a5.016 5.016 0 0 1-1.942 2.232A6.007 6.007 0 0 1 17 17h2a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5ZM5.424 9H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h2a6.007 6.007 0 0 1 4.366-5.768A5.016 5.016 0 0 1 5.424 9Z"/>
                        </svg>
                      </div>
                      </div>
                      <div className="pl-3 w-full">
                      <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                        <span className="font-semibold text-gray-700 dark:text-white">{g.creator} </span>
                          has invited you to join the <span className="font-semibold text-gray-700 dark:text-white">{g.grpName}</span> group
                      </div>
                      </div>
                    </a>
                    <div className="text-xs font-medium text-primary-600 dark:text-primary-500">                  
                        <a onClick={()=>(handleOfflGroupAccept(g))} style={{cursor: 'pointer'}} class="offlineAccept">Join</a>
                        <a onClick={()=>(handleOfflGroupDecline(g))} style={{cursor: 'pointer'}} class="offineDecline"> Decline</a>
                    </div>
                    </li>
                    ))}
                  </div>
              </ul>
              {/* End of group invites offline notif */}
                       
               {/* Start of join group requests offline notif */}
              <div className="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-600 dark:text-gray-300" id="offlJoinGroupRequestsTitle">
                Join Group Requests
              </div>
              <ul className="py-0 text-gray-700 dark:text-gray-200" id="offlineJoinGrpRequestsUL">
                  <div
                    className="block py-2 px-4 text-sm hover:bg-[#7ca3ba] dark:hover:bg-[#7096ac] dark:text-gray-600 dark:hover:text-white dark:bg-[#a5dcfc]"
                  >
                  {console.log("the pendingJoinGroupsReq from feed", pendingJoinGroups)}
                    {pendingJoinGroups.map((jg)=> (
                      <li key={jg.grpID} id={jg.grpID} >
                       <a href="#" className="flex py-3 px-4 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600">
                      <div className="flex-shrink-0">
                      <img
                        className="w-11 h-11 rounded-full"
                        src={jg.memberURL || jg.memberImage || "https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj"}
                        alt="groupInvite"
                      />
                      <div className="flex absolute justify-center items-center ml-6 -mt-5 w-5 h-5 bg-gray-900 rounded-full border border-white dark:border-gray-700">
                        <svg
                          aria-hidden="true"
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 19"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                        <path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z" />
                        <path d="M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h-.424a5.016 5.016 0 0 1-1.942 2.232A6.007 6.007 0 0 1 17 17h2a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5ZM5.424 9H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h2a6.007 6.007 0 0 1 4.366-5.768A5.016 5.016 0 0 1 5.424 9Z"/>
                        </svg>
                      </div>
                      </div>
                      <div className="pl-3 w-full">
                      <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                        <span className="font-semibold text-gray-700 dark:text-white">{jg.member} </span>
                          wishes to join your <span className="font-semibold text-gray-700 dark:text-white">{jg.grpName}</span> group
                      </div>
                      </div>
                    </a>
                    <div className="text-xs font-medium text-primary-600 dark:text-primary-500">                  
                        <a onClick={()=>(handleOfflGroupAccept(jg))} style={{cursor: 'pointer'}} class="offlineAccept">Join</a>
                        <a onClick={()=>(handleOfflGroupDecline(jg))} style={{cursor: 'pointer'}} class="offineDecline"> Decline</a>
                    </div>
                    </li>
                    ))}
                  </div>
              </ul>
              {/* End of join group requests offline notif */}


              {/* Start of event invite offline notif */}
              <div className="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-600 dark:text-gray-300" id="offlEventsTitle">
                Events
              </div>
              <ul className="py-0 text-gray-700 dark:text-gray-200" id="offlineFollowsUL">
                  <div
                    className="block py-2 px-4 text-sm hover:bg-[#7ca3ba] dark:hover:bg-[#7096ac] dark:text-gray-600 dark:hover:text-white dark:bg-[#a5dcfc]"
                  >
                    {pendingNotif.map((f)=> (
                      <li key={f.followID}>
                       <a href="#" className="flex py-3 px-4 border-b hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600">
                      <div className="flex-shrink-0">
                      <img
                        className="w-11 h-11 rounded-full"
                        //src={(f.followerURL).substring(0,3)==="" && (f.followerImage).substring(0.3)==="" ? "https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj" :(f.followerURL).substring(0,3)==="htt" ? f.followerURL : f.followerImage}
                        src={f.followerURL || f.followerImage || "https://yt3.googleusercontent.com/-CFTJHU7fEWb7BYEb6Jh9gm1EpetvVGQqtof0Rbh-VQRIznYYKJxCaqv_9HeBcmJmIsp2vOO9JU=s900-c-k-c0x00ffffff-no-rj"}
                      alt="eventInvite"
                      />
                      <div className="flex absolute justify-center items-center ml-6 -mt-5 w-5 h-5 bg-gray-900 rounded-full border border-white dark:border-gray-700">
                        <svg
                          aria-hidden="true"
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6 1a1 1 0 0 0-2 0h2ZM4 4a1 1 0 0 0 2 0H4Zm7-3a1 1 0 1 0-2 0h2ZM9 4a1 1 0 1 0 2 0H9Zm7-3a1 1 0 1 0-2 0h2Zm-2 3a1 1 0 1 0 2 0h-2ZM1 6a1 1 0 0 0 0 2V6Zm18 2a1 1 0 1 0 0-2v2ZM5 11v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 11v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 15v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 15v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 11v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM5 15v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM2 4h16V2H2v2Zm16 0h2a2 2 0 0 0-2-2v2Zm0 0v14h2V4h-2Zm0 14v2a2 2 0 0 0 2-2h-2Zm0 0H2v2h16v-2ZM2 18H0a2 2 0 0 0 2 2v-2Zm0 0V4H0v14h2ZM2 4V2a2 2 0 0 0-2 2h2Zm2-3v3h2V1H4Zm5 0v3h2V1H9Zm5 0v3h2V1h-2ZM1 8h18V6H1v2Zm3 3v.01h2V11H4Zm1 1.01h.01v-2H5v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H5v2h.01v-2ZM9 11v.01h2V11H9Zm1 1.01h.01v-2H10v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H10v2h.01v-2ZM9 15v.01h2V15H9Zm1 1.01h.01v-2H10v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H10v2h.01v-2ZM14 15v.01h2V15h-2Zm1 1.01h.01v-2H15v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H15v2h.01v-2ZM14 11v.01h2V11h-2Zm1 1.01h.01v-2H15v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H15v2h.01v-2ZM4 15v.01h2V15H4Zm1 1.01h.01v-2H5v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H5v2h.01v-2Z"/>
                        </svg>
                      </div>
                      </div>
                      <div className="pl-3 w-full">
                      <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{f.followerUN} </span>
                          has invited you to event {f.influencerUN}
                      </div>
                      </div>
                    </a>
                    <div className="text-xs font-medium text-primary-600 dark:text-primary-500">                  
                        <a onClick={()=>(handleOfflFollowAccept(f))} style={{cursor: 'pointer'}} class="offlineAccept">Accept</a>
                        <a onClick={()=>(handleOfflFollowDecline(f))} style={{cursor: 'pointer'}} class="offineDecline"> Decline</a>
                    </div>
                    </li>
                    ))}
                  </div>
              </ul>
              {/* End of event invite offline notif*/}

            </div>
             {/* End of offline Notifications Dropdown menu */}
          </div>
          
        </div>
        <div
          id="submitPosts"
          className="bg-white border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 h-96 dark:bg-gray-800 mb-4"
        >
          <div className="  dark:bg-gray-800 dark:text-white flex justify-left items-left flex-col" id="addPost">
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
                <option name="almostPrivate" value={Visibility}>
                  Almost Private
                </option>
              </select>
              <ul className="inline-block">
              {Visibility == "Almost Private" && allData.current.followers?
              allData.current.followers.map( (follower, index) => (
                <li key={index}>
                  <input type="checkbox" name={follower} onClick={(e) => {handlePostViewers(e)}}/>
                  <label htmlFor={follower}>{follower}</label>
                </li>
              )
              ): Visibility == "Almost Private"?
              <p>You have no followers.</p> :
               null
              }
              </ul>
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
          <Posts sPost={sPost} page={"feed"} username={""}/>
        </div>
      </main>
    </div>
  );
};



export default Feed;