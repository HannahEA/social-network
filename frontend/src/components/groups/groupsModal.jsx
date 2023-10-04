import React from "react";
import { useState } from 'react';
import { useWebSocket } from "../WebSocketProvider.jsx";



function GroupsModal({closeGroups, followers}){

  const { websocketRef, isWebSocketConnected} = useWebSocket();

  // to close the groups modal
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
          closeGroups();
        }
      };

    //store new group form inputs
    const [newGroupInputs, setNewGroupInputs] = useState({});
    const[joinGroup, setJoinGroup] = useState({});

    //collect new group form's info
    const handleNewGP = (event) => {
      const {name, value} = event.target;
      setNewGroupInputs({...newGroupInputs, [name]: value})
    }


  
    //process user inputs for new group & send through ws
    const handleSubmitNewGP = (event) => {
      event.preventDefault();
      //clear text inputs
      document.getElementById("grpName").value = ""; // Clear the group name value
      document.getElementById("grpDescr").value = ""; // Clear the group description value
      
      //clear checkboxes
      const grpMembers = document.querySelectorAll('input[type="checkbox"]:checked')//make HTMLCollection
      for (let i = 0; i < grpMembers.length; i++){
        grpMembers[i].checked = false; //un-tick check boxes
      }

      alert(JSON.stringify(newGroupInputs, null, 2)); // Convert to JSON string for display; the second argument null is for replacer function, and the third argument 2 is for indentation
      //send reply object to back end
        setNewGroupInputs({...newGroupInputs, ["type"]: "newGroup"});
        console.log("new group sent to b.e.:", newGroupInputs);

        websocketRef.current.send(
        JSON.stringify(newGroupInputs)

        
    )
    };

    const handleSelectGP = (event) => {
      const {name, value} = event.target;
      setJoinGroup({...joinGroup, [name]: value})
    }

    //process join group
    const handleSubmitJoinGP = (event) => {

      event.preventDefault();
      
      //clear checkboxes
      const joinForm = document.getElementById("joinGP");
      const joinGrps = joinForm.querySelectorAll('input[type="checkbox"]:checked')//make HTMLCollection
      console.log("does joinGrps HTMLCollection work?",joinGrps);
      for (let i = 0; i < joinGrps.length; i++){
        joinGrps[i].checked = false; //un-tick check boxes
      }

      //alert(JSON.stringify(joinGrps, null, 2)); // Convert to JSON string for display; the second argument null is for replacer function, and the third argument 2 is for indentation
      alert(joinGrps, null,2)
      //send reply object to back end
        setJoinGroup({...joinGroup, ["type"]: "joinGrp"});
        console.log("join group to be sent to the b.e.:", joinGroup);

        websocketRef.current.send(
        JSON.stringify(joinGroup)

        
    )
    };
    

      
      return (
        <div id="modalOverly" className="modal-overlay" onClick={handleOverlayClick}>
          <div id="modalContainer" className="bg-[#a8daf7] relative top-1 x-3 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(60%-1rem)] gpsModal-content dark:bg-[#81b7d7]">
            <button className="hover:bg-[#f3bca1] hover:text-gray-200 hover:shadow-gray-400 dark:hover:bg-[#65c3f9] shadow-md z-50 pb-3 pt-3 modal-close dark:text-white ml-60 pr-3 pl-3 font-bold bg-[#c7e6f8] dark:bg-[#57aada]  text-[#57aada] rounded-md" onClick={() => {closeGroups()}}>
              Close
            </button>
            {/* {children} */}
            <div id="makeNewGroupModal" className="bg-[#a8daf7] dark:bg-[#81b7d7]  absolute top-6 pb-4 pt-4">
            <p className="font-bold text-center text-lg dark:text-[#3f82a9] text-[#4893be]"><strong>Make a group</strong></p>
              <div id="newGroupForm">
              <form onSubmit={handleSubmitNewGP} className="bg-[#a8daf7] dark:bg-[#81b7d7]">
                <br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Group name:
                <input type="text" name="grpName" value={newGroupInputs.grpName || ""} onChange={handleNewGP} placeholder="Enter group name" className="border-hidden mb-6 ml-6 bg-[#c7e6f8] dark:bg-[#90d0f5] w-[calc(50%-1rem)] rounded-md" id="grpName"/>
                </label><br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Description:
                <input type="text" name="grpDescr" value={newGroupInputs.grpDescr || ""} onChange={handleNewGP} placeholder="Enter description" className="border-hidden mb-6 ml-6 bg-[#c7e6f8] dark:bg-[#90d0f5] w-[calc(70%-1rem)] rounded-md" id="grpDescr"/>
                </label>
                <p className="ml-2 text-[#717575] dark:text-white">Invite group members:</p>
                  <br></br>
                <ul className="flex space-x-4">
                  <li>
                    <input class="chk" name="Jackie" type="checkbox" onChange={handleNewGP} border="hidden" background-color="white" className="rounded-sm h-4 w-4 ml-1 cursor-pointer accent-[#57aada]"/>
                    <label class="addToGroup dark:text-[#3f82a9]">Jackie</label>
                  </li>
                  <li>
                    <input class="chk" name="Arabella"  type="checkbox" onChange={handleNewGP} border="hidden" background-color="white" className="h-4 w-4 ml-1 cursor-pointer accent-[#57aada] "/>
                    <label class="addToGroup dark:text-[#3f82a9]">Arabella</label>
                  </li>
                  <li>
                    <input class="chk" name="Lee"  type="checkbox" onChange={handleNewGP} border="hidden" className="h-4 w-4 bg-white ml-1 cursor-pointer accent-[#57aada] "/>
                    <label class="addToGroup dark:text-[#3f82a9]">Lee</label>
                  </li>
                </ul>
                <div id="addFollowersToGroup" className="text-sm font-sm text-[#717575] dark:text-primary-500">
               
                </div>
                <div>
                <input type="submit" id="newGpSubmit" value="Create group"
                  className="cursor-pointer absolute justify-center flex items-center p-2 w-[calc(35%-1rem)] text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#57aada] dark:bg-[#4e99c4] hover:bg-[#4c97c2] hover:text-[#c2e5f9]
                  shadow-lg dark:text-white dark:hover:bg-[#64afda]
                  [box-shadow:0_3px_0_0_#407da1]"
                />
                </div>
              </form>
              </div>
              <br></br>
              <br></br>
              <br></br>

              
              <hr class="dottedL"></hr>
              <div >
              <br></br>
              <p className="font-bold text-lg text-center dark:text-[#3f82a9] text-[#4893be]">Groups</p>
                <br></br>
                <div >
                <form id="joinGP" onSubmit={handleSubmitJoinGP}>
                  <ul>
                  <span>
                  
                  <li className="py-2 px-2 text-ml hover:bg-[#c7e6f8] dark:hover:bg-[#5a9fc6] dark:hover:text-[#2f627f] flex space-x-4">
                  <input class="chkJoin" name="FriendsID"  type="checkbox" onChange={handleSelectGP} border="hidden" className="h-4 w-4 bg-white mt-1 ml-1 cursor-pointer accent-[#57aada]"/>
                  <p style={{cursor: 'pointer'}} class="addToGroup font-bold dark:text-[#3f82a9] dark:hover:text-[#2f627f] ">Friends of happiness </p>
                  <p  className="dark:text-white text-[#717575]"> Antisocial social club</p></li></span>
                  <span>
                  <li className="py-2 px-2 text-ml hover:bg-[#c7e6f8] dark:hover:bg-[#5a9fc6] dark:hover:text-[#2f627f]  flex space-x-4">
                  <input class="chkJoin" name="BandID"  type="checkbox" onChange={handleSelectGP} border="hidden" className="h-4 w-4 bg-white mt-1 ml-1 cursor-pointer accent-[#57aada]"/>
                  <p style={{cursor: 'pointer'}} class="addToGroup font-bold dark:text-[#3f82a9] dark:hover:text-[#2f627f]">Band of saints</p>
                  <p  className="dark:text-white text-[#717575]"> Antisocial social club</p></li></span>
                  </ul>
                  <div>
                  <br></br>
                  <input type="submit" id="joinGpSubmit" value="Join group"
                  className="cursor-pointer absolute justify-center flex items-center p-2 w-[calc(35%-1rem)] text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#66c3f8] dark:bg-[#4e99c4]  hover:bg-[#4c97c2] hover:text-[#c2e5f9]
                  shadow-lg dark:text-white dark:hover:bg-[#62bef3]
                  [box-shadow:0_3px_0_0_#407da1]"
                />
                </div>
                </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
}

export default GroupsModal;