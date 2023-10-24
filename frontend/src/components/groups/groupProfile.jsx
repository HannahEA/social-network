
import React from "react";
import {useState} from "react";
import { useWebSocket } from "../WebSocketProvider.jsx";
//this is the modal that contains a group's profile

function GroupProfile({ children, onGpClose, followers, request, theGroup}) {

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
      gCreator: theGroup.creator,
      gName: theGroup.grpName,
      gDescr: theGroup.grpDescr,
      gId: theGroup.id,
      invitedBy: request,
      invitedWho: follower,
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
        {children}
        <div id="addMember">
        <form name="addMember" id="addMember" onSubmit={handleGroupInvite}>
          <span><label className="info">Invite other people : </label></span>
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
        </div>
      </div>
    </div>
  );
}

export default GroupProfile;