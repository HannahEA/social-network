
import React from "react";
import {useState} from "react";
import { useWebSocket } from "../WebSocketProvider.jsx";
import {SubmitPost, Posts, Tags} from "../feed/Posts.jsx";
import EventProfile from "./newEventProfile.jsx";
import AllEventsProfiles from "./allEventsProfiles.jsx";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
//This is one group's modal that allows to create group events, invite followers 
//to join the group, and make group posts & comments

const notyf = new Notyf(); // Create a single instance of Notyf


function GroupProfile({ children, showNewEvt, setShowNewEvt, showEvents, grpMember, onGpClose, followers, request, theGroup, creator, setEvt, theEvt, gEvents }) {

{console.log("the group events inside the GroupProfile component: +++++> ",gEvents)}

// const [newGrpEvt, setNewGrpEvt] = useState({["type"]: "newEvent"});
//const [showNewEvt, setShowNewEvt] = useState(false);



    //make a new event object
    const handleNewEvt = (event) => {
      const { name, value } = event.target;

      setEvt({ ...theEvt, [name]: value, "evtCreator": request, "grpID": theGroup.id, "grpCreator":theGroup.creator, "grpMembers":theGroup.gpMembers, "grpDescr":theGroup.grpDescr, "grpName":theGroup.grpName });

    };

    //Send the event object to the back end
    //and show the event profile with options
    const handleSubmitNewEvt = (event) => {
      event.preventDefault();

      //clear text inputs
       document.getElementById("evtName").value = ""; // Clear the group name value
       document.getElementById("evtDescr").value = ""; // Clear the group description value
       document.getElementById("evtDateTime").value = ""; //Clear the date and time falues

        console.log("new event inputs sent to b.e.:", theEvt);

      // Display a success notification
      notyf.success("New event created");

      //display event profile on group profile page
      setShowNewEvt(true);
        
      //send the new event object to the back end
        websocketRef.current.send(
        JSON.stringify(theEvt) 
        )
    };

  //--------End of CREATE EVENT

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
        <form name="addMember" id="addMember" onSubmit={handleGroupInvite} className=" bg-[#a8daf7] dark:bg-[#81b7d7] space-between rounded-md h-72">
        <p className="mt-5 font-bold text-center text-lg dark:text-[#53a9db] text-[#378dbe]">Invite other people</p>
          <br></br>
          <span><label className="ml-8 mr-5 text-[#717575] dark:text-white">Select people : </label></span>
          <span>
            <select id="dropDown" name="choosePeople" className="mr-8 border-b-2 border-green shadow-md choosePeople rounded-md text-[#53a1ce] bg-[#bfe0f3] p-1" onChange={handleAddMember}>
            <optgroup label="Available followers" >
            <option key="" value="" disabled selected hidden>Choose a name</option>
            {followers == null ? <label class="addToGroup dark:text-[#3f82a9]">No followers available</label> : followers.map((follw) => (
              follw != theGroup.creator && theGroup.gpMembers.includes(follw) === false ?  (
              <option key={follw} value={follw} >{follw}</option>
              ) : (
             <option key={follw} value='none'></option>
              ) 
            ))}
            </optgroup>
            </select>
          </span>
          <br></br>
              <div>
                <input type="submit" id="joinGpSubmit" value="Invite to join"
                  className="cursor-pointer absolute justify-center flex items-center p-2 w-[calc(35%-1rem)] text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#57aada] dark:bg-[#4e99c4] hover:bg-[#4c97c2] hover:text-[#c2e5f9]
                  shadow-lg dark:text-white dark:hover:bg-[#64afda]
                  [box-shadow:0_3px_0_0_#407da1]"
                />
              </div>
          </form>

          {/* end of group invites */}

          {/* start of group posts */}
          
          <form onSubmit={submitPost} className="space-between bg-[#a8daf7] dark:bg-gray-600 rounded-md h-72">
          <p className="mt-5 font-bold text-center text-lg dark:text-[#53a9db] text-[#378dbe]">Create a post</p>
              <span className="flex p-2.5 pl-5">
                <p className="flex-row mr-5 text-[#717575] dark:text-white">Title:</p>
                <input
                  className="pTitle flex-row border-b-2 border-green shadow-md dark:bg-[#81b7d7] dark:text-white focus:outline-none rounded-md bg-[#c7e6f8]"
                  type="text"
                  placeholder="Enter title"
                  value={Title}
                  onChange={handleTitle}
                />
              </span>

              <span className="flex p-2.5 pl-5">
                <p className="flex-row mr-5 text-[#717575] dark:text-white">Post:</p>
                <input
                  className="pContent flex-row border-b-2 border-green shadow-md dark:bg-[#81b7d7] dark:text-white focus:outline-none rounded-md bg-[#c7e6f8]"
                  type="text"
                  name="postContent"
                  id="postContent"
                  maxLength="100"
                  placeholder="Enter post"
                  value={Content}
                  onChange={handleContent}
                />
              </span>

              <span className="flex p-2.5 pl-5">
                <p className="flex-row mr-5 text-[#717575] dark:text-white">Tags:</p>
                <input
                  type="text"
                  id="postTags"
                  placeholder="Enter tag"
                  className="pTags flex-row mr-5 border-b-2 border-green shadow-md dark:bg-[#81b7d7] dark:text-white focus:outline-none rounded-md bg-[#c7e6f8]"
                />
                <button
                  onClick={addTag}
                  type="submit"
                  value="Add Tag"
                  className="ml-2 flex-row pl-2  pr-2  bg-[#57aada] dark:bg-[#4e99c4] hover:bg-[#4c97c2] hover:text-[#c2e5f9] text-white rounded-md cursor-pointer shadow-lg"
                >
                  Add Tag
                </button>
              </span>
              <Tags tags={tag} />
             
              <div className="flex">
              <p className="flex-row ml-5 mr-5 text-[#717575] dark:text-white">Image:</p>
                <input
                  type="text"
                  name="imageUrl"
                  id="imageUrl"
                  placeholder="Enter image URL"
                  className="pTags border-b-2 border-green shadow-md m-2.5 pl-5 pr-5 rounded-md focus:outline-none focus:ring-primary-500 focus:border-gray-600 dark:bg-[#aedbf5] dark:text-white bg-[#c7e6f8]"
                  // value={imageURL}
                  onChange={handlePostImage}
                />
                <label
                  htmlFor="imageFile"
                  className="ml-5 m-2.5 pl-2  pr-2  items-center justify-center bg-[#57aada] dark:bg-[#4e99c4] hover:bg-[#4c97c2] hover:text-[#c2e5f9] text-white border border-transparent rounded-lg cursor-pointer shadow-lg"
                >
                  Upload file
                </label>
                <input type="file" name="mageFile" id="imageFile" accept="image/*" className="hidden bg-[#46a3da]" onChange={handlePostImage}/>
              </div>
              <div className="justify-center flex">
              <button  type="submit" className="cursor-pointer items-center p-2 w-[calc(35%-1rem)] text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#57aada] dark:bg-[#4e99c4] hover:bg-[#4c97c2] hover:text-[#c2e5f9]
                  shadow-lg dark:text-white dark:hover:bg-[#64afda]
                  [box-shadow:0_3px_0_0_#407da1]">
                Add post
              </button>
              </div>
            </form>
            {/* end of group posts */}

            {/* start of group events */}
           
              <form onSubmit={handleSubmitNewEvt} className=" bg-[#a8daf7] dark:bg-[#81b7d7] space-between rounded-md h-72">
                <p className="mt-5 font-bold text-center text-lg dark:text-[#53a9db] text-[#378dbe]">Organize an event</p>
                <br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Event name:
                <input type="text" name="evtName" valuechkJoin={theEvt.grpName || ""} onChange={handleNewEvt} placeholder="Enter event name" className="border-b-2 border-green shadow-md mb-6 ml-6 bg-[#c7e6f8] dark:bg-[#90d0f5] w-[calc(50%-1rem)] rounded-md" id="evtName" required />
                </label><br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Description:
                <input type="text" name="evtDescr" onChange={handleNewEvt} placeholder="Enter description" className="border-b-2 border-green shadow-md mb-6 ml-6 bg-[#c7e6f8] dark:bg-[#90d0f5] w-[calc(70%-1rem)] rounded-md" id="evtDescr" required/>
                </label>
              <br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Date and time:
                <input
                id="evtDateTime"
                type="datetime-local" name="evtDateTime" 
                className="mb-6 ml-6 bg-[#c7e6f8] border-b-2 border-green shadow-md text-[#717575] sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2.5 dark:bg-[#c7e6f8] dark:border-gray-400 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                 onChange={handleNewEvt} 
                  // ref={dateInputRef}
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

            {/* end of group events */}
            
        </div>
        {/* end of group invites, group posts, group events */}
        
        <div id="showEvts" style={{ visibility:`${grpMember ? 'visible' : 'hidden'}`}}>
        {showNewEvt && (
          <EventProfile
            newEvt={theEvt}
            user={creator}
          />
        )}
        </div>
        <div id="showAllEvts" style={{ visibility:`${grpMember ? 'visible' : 'hidden'}`}}>
        {showEvents && (
          <AllEventsProfiles
            user={request}
            gpEvents={gEvents}
          />
        )}
        </div>
       
          <div style={{ visibility:`${grpMember ? 'visible' : 'hidden'}`}} >

            <Posts page="groupProfile" groupID={theGroup.id} username ={""}/>
          </div>
        

        


      </div>
    </div>
  );
}

export default GroupProfile;