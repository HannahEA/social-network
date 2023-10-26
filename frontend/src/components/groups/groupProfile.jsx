
import React from "react";
import {useState, useRef} from "react";
import { useWebSocket } from "../WebSocketProvider.jsx";
import {SubmitPost, Posts, Tags} from "../feed/Posts.jsx";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
//This is the modal used to create new groups, join existing groups, and open a group's profile

const notyf = new Notyf(); // Create a single instance of Notyf


function GroupProfile({ children, grpMember, onGpClose, followers, request, theGroup, creator}) {

  

  
  //--------CREATE EVENT

  const handleAccept = () => {

    //Store user reply
    let reply = "Yes";
    // Make a reply object
    var YesNo = {
        // "grpID": (props.joinRequest.grpID),
        // "groupMember": (props.joinRequest.joinRequestBy),
        // "joinReply": reply,
        // "type": "joinGroupReply",
    };

    console.log("the joinGroupReply sent to back end: ", YesNo)

    //send reply object to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )
    // After handling the action, hide the Notification
    //props.setJoinGpVisible(false);

  };

  const handleNo = () => {
    //send to back end using the websocket:
    let reply = "No";
    // Make a reply object
    var YesNo = {
        // "grpID": (props.joinRequest.grpID),
        // "groupMember": (props.joinRequest.joinRequestBy),
        // "joinReply": reply,
        // "type": "joinGroupReply",
    };

    console.log("the joinGroupReply sent to back end: ", YesNo)
    //send user reply to back end
    websocketRef.current.send(
      JSON.stringify(YesNo)
    )
    // After handling the action, hide the Notification
    //props.setJoinGpVisible(false);

  };

    //when the user selects a date.
    const handleDateChange = (e) => {
      setDOB(e.target.value);
    };

    const [date, setDOB] = useState('');
    const dateInputRef = useRef(null);

// to be removed at a later date

const [newGroupEvt, setNewGroupEvt] = useState({["type"]: "newEvent"});

    //make a new group
    const handleNewEvt = (event) => {
      const { name, value } = event.target;

          setNewGroupEvt({ ...newGroupEvt, [name]: value, "invitedBy": request, "grpID": theGroup.id, "creator":theGroup.creator, "gpMembers":theGroup.gpMembers, "grpDescr":theGroup.grpDescr, "grpName":theGroup.grpName });

    };

    const handleSubmitNewEvt = (event) => {
      event.preventDefault();

      //clear text inputs
       document.getElementById("evtName").value = ""; // Clear the group name value
       document.getElementById("evtDescr").value = ""; // Clear the group description value
       document.getElementById("evtDateTime").value = ""; //Clear the date and time falues

        console.log("new event inputs sent to b.e.:", newGroupEvt);

      // Display a success notification
      notyf.success("New event created");

      //Show the event on group profile page
      var newEvt = document.createElement('div')//is a node

      newEvt.innerHTML =`
        <p style="font:'semibold'; color:'gray'; dark:text-white; padding:'10px';">Event invite </p>
        <p id="evt"><span style="font:'semibold'; color:'gray'; padding:'10px';">${request} </span>has invited you to event: </p>
        
        <p >Name: <span style="font:'semibold'; color:'gray'; padding:'10px';">${newGroupEvt.evtName}</span></p>
        <p >Description: <span style="font:'semibold'; color:'gray';  padding:'10px';">${newGroupEvt.evtDescr}</span></p>
        <span>
        <button id="btnNotifOK"
          onClick={handleAccept}
          style="  hover:'#3488af';  backgroundColor:'#57aada'; fontWeight:'strong'; padding:'10px';"
        >
          Accept
        </button>
        </span>
        <span>
        <button id="btnNotifNO"
          onClick={handleNo}
          style="hover:'#3488af'; backgroundColor:'#57aada'; fontWeight:'strong'; items-center; padding:'10px';"
        >
          Decline
        </button>
        </span>

      `;

      newEvt.classList.add("addEvent");

      //append the new event inside DOM
      document.querySelector("#showEvts").appendChild(newEvt);
        
        websocketRef.current.send(
        JSON.stringify(newGroupEvt)  
        )
    };

// end of to be removed

//-----------SUBMIT POST 

const [Title, setTitle] = useState("")
  const [Content, setContent] = useState("")
  const [Visibility, setVisibility] = useState("")
  const [tag, setTags] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imageURL, setImageURL] = useState("")
  const [sPost, setSpost] = useState(null)
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
      let data = await SubmitPost({ title: Title, content: Content, visibility: v, url: imageURL, file: imageFile, category: tag , postViewers: [], groupID: theGroup.id});
      setSpost(data);
      setTitle("");
      setTags([])
      setContent("");
      setImageURL(null);
      setImageFile("");
    };
   
const { websocketRef, isWebSocketConnected} = useWebSocket();
 
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onGpClose();
    }
  };

  const [inviteMember, setInviteMember] = useState({["type"]:"groupInvite"})

  //get follower to send group invite to
function handleAddMember(){
  var follower = document.querySelector("#dropDown").value;
  console.log("the chosen follower is: ===>>",follower)

    //The js object to be sent to b.e. via w.s.
    setInviteMember( {
      ...inviteMember,
      creator: theGroup.creator,
      grpName: theGroup.grpName,
      grpDescr: theGroup.grpDescr,
      grpID: theGroup.id,
      invitedBy: request,
      member: follower,
     }
    )
     console.log("Info to join a group: =====> ", inviteMember)
  }




const handleGroupInvite = (e) => {
    e.preventDefault();

    let reSet = document.querySelector("#dropDown").options[0];
    reSet.selected = true;

    websocketRef.current.send(
      JSON.stringify(inviteMember)
     )

  }


  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
     <div className="dark:bg-gray-600 w-3/4 bg-white p-4 m-6 position-relative overflow-auto max-h-screen min-h-min min-w-fit"> 
        
        <button className="modal-close text-white dark:text-white" onClick={() => {onGpClose()}} classn="ml-60  pl-5 pr-5 font-bold bg-[#00cec9] text-[#255f5a] rounded-md">
          Close
        </button>
        <div className="flex justify-around">
        {children}
        </div>

         {/* start of group invites, group posts, group events */}
        <div id="addMember" className="flex justify-around" style={{ visibility:`${grpMember ? 'visible' : 'hidden'}`}}>

      {/* start of group invites */}
        <form name="addMember" id="addMember" onSubmit={handleGroupInvite} className="justify-around">
          <span><label className="info dark:text-white">Invite other people : </label></span>
          <span>
            <select id="dropDown" name="choosePeople" className="choosePeople rounded-md text-[#53a1ce] bg-[#bfe0f3] p-1" onChange={handleAddMember}>
            <optgroup label="Your followers" >
            <option key="" value="" disabled selected hidden>Choose a name</option>
            {followers == null ? <label class="addToGroup dark:text-[#3f82a9]">No followers available</label> : followers.map((follw) => (
              <option key={follw} value={follw} >{follw}</option>
            ))}
            </optgroup>
            </select>
          </span>
              <div>
                <input type="submit" id="joinGpSubmit" value="Invite"
                  className="cursor-pointer absolute justify-center flex items-center p-2 w-[calc(35%-1rem)] text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#57aada] dark:bg-[#4e99c4] hover:bg-[#4c97c2] hover:text-[#c2e5f9]
                  shadow-lg dark:text-white dark:hover:bg-[#64afda]
                  [box-shadow:0_3px_0_0_#407da1]"
                />
              </div>
          </form>
          {/* end of group invites */}

          {/* start of group posts */}
          
          <form onSubmit={submitPost} className="justify-between">
          <p className="font-bold text-center text-lg dark:text-[#3f82a9] text-[#378dbe]">Create a post</p>
              <span className="flex p-2.5 pl-5">
                <p className="flex-row mr-5 font-bold text-[#5aadde]">Title</p>
                <input
                  className="flex-row border-b-2 border-green shadow-md dark:bg-gray-800 dark:text-white focus:outline-none"
                  type="text"
                  value={Title}
                  onChange={handleTitle}
                />
              </span>

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
            {/* end of group posts */}

            {/* start of group events */}
            <div id="newGroupForm">
            <p className="font-bold text-center text-lg dark:text-[#3f82a9] text-[#5fc1fa]">Create an event</p>
              <form onSubmit={handleSubmitNewEvt} className=" bg-[#a8daf7] dark:bg-[#81b7d7] justify-between rounded-md h-72">
                <br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Group name:
                <input type="text" name="evtName" valuechkJoin={newGroupEvt.grpName || ""} onChange={handleNewEvt} placeholder="Enter group name" className="border-hidden mb-6 ml-6 bg-[#c7e6f8] dark:bg-[#90d0f5] w-[calc(50%-1rem)] rounded-md" id="evtName" required />
                </label><br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Description:
                <input type="text" name="evtDescr" onChange={handleNewEvt} placeholder="Enter description" className="border-hidden mb-6 ml-6 bg-[#c7e6f8] dark:bg-[#90d0f5] w-[calc(70%-1rem)] rounded-md" id="evtDescr" required/>
                </label>
              <br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Date and time:
                <input
                id="evtDateTime"
                type="datetime-local" name="evtDateTime" 
                className="mb-6 ml-6 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                 onChange={handleNewEvt} 
                  ref={dateInputRef}
                />
                </label>
                <div className="justify-center flex">
                <input type="submit" id="newGpSubmit" value="Create event"
                  className="cursor-pointer  items-center p-2 w-[calc(35%-1rem)] text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#57aada] dark:bg-[#4e99c4] hover:bg-[#4c97c2] hover:text-[#c2e5f9]
                  shadow-lg dark:text-white dark:hover:bg-[#64afda]
                  [box-shadow:0_3px_0_0_#407da1]"
                />
                </div>
              </form>
              </div>

            {/* end of group events */}
            
        </div>
        {/* end of group invites, group posts, group events */}
        
        <div id="showEvts">

        </div>
       
          <div style={{ visibility:`${grpMember ? 'visible' : 'hidden'}`}} >

            <Posts page="groupProfile" groupID={theGroup.id} username ={""}/>
          </div>
        

        


      </div>
    </div>
  );
}

export default GroupProfile;