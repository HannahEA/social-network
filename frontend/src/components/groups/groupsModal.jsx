import React from "react";
import { useState } from 'react';
import { useWebSocket } from "../WebSocketProvider.jsx";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
//This is the modal used to create new groups, join existing groups, and open a group's profile

const notyf = new Notyf(); // Create a single instance of Notyf



function GroupsModal({onClose, setGrpProfileVisible, setGrp, grpProfileVisible, setGrpMember, grpMember, followers, creator, allGroups, request }){

console.log("the request inside 'GroupsModal': ",request)

  const { websocketRef, isWebSocketConnected} = useWebSocket();

  // to close the groups modal
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      };

    //store new group form inputs
    const [newGroupInputs, setNewGroupInputs] = useState({["type"]: "newGroup"});
    const [gpMembers, setGpMembers] = useState([request]);
    //store join group form selections
    const[gpList, setGpList] = useState([])
    var joinGpInfo
    var updatedGpList = [];

    //make a new group
    const handleNewGP = (event) => {
      const { name, value } = event.target;

      // Check if the input is a checkbox with a value of "on"
      if (event.target.type === "checkbox" && value === "on") {
        // Clone the existing array of group info and add the checkbox name to it
        const updatedGpMembers = [...gpMembers, name];
        setGpMembers(updatedGpMembers); 
         // Update the newGroupInputs state, incorporating the gpMembers array
          setNewGroupInputs({
          ...newGroupInputs,
              gpMembers: updatedGpMembers,
              creator: creator,
          });
      }else{
          // Update the newGroupInputs state for other inputs
              setNewGroupInputs({ ...newGroupInputs, [name]: value });
      }

    };


  
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

      //alert(JSON.stringify(newGroupInputs, null, 2)); // Convert to JSON string for display; the second argument null is for replacer function, and the third argument 2 is for indentation

        console.log("new group inputs sent to b.e.:", newGroupInputs);

      // Display a success notification
      notyf.success("New group created");
        
        websocketRef.current.send(
        JSON.stringify(newGroupInputs)

        
    )
    };

    //user joins a group
    const handleJoinGP = (event) => {
      let selectedGroup
      const {name, value} = event.target;
      // Check if the input is a checkbox with a value of "on"
          if (event.target.type === "checkbox" && value === "on") {
           //use group id to derive sliceOfGroups array index
          let index = allGroups.sliceOfGroups.findIndex(({ id }) => id.toString() === name);
          console.log("*****groupID found in sliceOfGroups*****")
            //get information for selected group
            selectedGroup = allGroups.sliceOfGroups[index]

          //if selectedGroup exists get group info
          if (selectedGroup) {
            joinGpInfo = {
            type: "oneJoinGroupRequest",
            grpID: name,
            joinRequestBy: creator,
            grpCreator: selectedGroup.creator,
            grpName: selectedGroup.grpName,
            grpDescr: selectedGroup.grpDescr,
          }

          console.log("the joinGroup to be added to gpList: ", joinGpInfo)
          updatedGpList.push(joinGpInfo);
    
          // Clone the existing 'gpList' slice and add the updated joinGroup to it
          setGpList([...gpList, joinGpInfo]);
  
          console.log("the updatedGpList is: ---->", updatedGpList)

          console.log("the gpList sent to b.e.: ====> ", gpList)
         };

          
        }
        
        // setGpList(updatedGpList)
        console.log("the gpList sent to b.e.: ====> ", gpList)
      }


      // //make the group profile page visible
      const handleOpenGpProfile = () => {
        setGrpMember(true);
        setGrpProfileVisible(true);
        onClose()
      };

      //change state variable object 'setGrp' 
      const handleSelectGrp = (grp) => {
        console.log("the group data: ", grp)
        setGrp((prevState) => ({
          ...prevState,
          id: grp.id,
          creator: grp.creator,
          gpMembers: grp.gpMembers,
          grpDescr: grp.grpDescr,
          grpName: grp.grpName,
          type: grp.type
        }
        )
      )
      //request group events through ws
      const getGpEvents = {
        grpID: grp.id,
        grpName: grp.grpName,
        evtMember: request,
        type: "getGpEvents"
      }
      console.log("the group events request sent to the b.e.: ", getGpEvents);

      websocketRef.current.send(
        JSON.stringify(getGpEvents)
      )
      }


    //process submit join group
    const handleSubmitJoinGP = (event) => {

      event.preventDefault();

      //select all active checkboxes within 'joinGP'
      const joinGrps = document.querySelectorAll('input[type="checkbox"]:checked')//make HTMLCollection
      //un-tick check boxes
      for (let i = 0; i < joinGrps.length; i++){
        joinGrps[i].checked = false; 
      }

        let nbCheck = gpList.length
        console.log("join groups state variable 'gpList' to be sent to the b.e.:", gpList);

      // Display a success or error notification
      if (nbCheck >= 1){
        notyf.success("Join group request sent");
      }else{
        notyf.error("Select at least one group");
        return
      }
      
      //the join group request object sent to back end
      let allJoinGroupRequests = {
        type: "allJoinGrRequests",
        allJoinGrRequests: gpList,
      }

      console.log("The allJoinGroupRequests object sent to b.e.: ", allJoinGroupRequests)

        //send the group request object to back end
        websocketRef.current.send(
        JSON.stringify(allJoinGroupRequests)
    )
    };

    console.log("printing outside of the component 'gpList' to be sent to the b.e.:++++++++>", gpList);
      
      return (
        <div id="modalOverly" className="z-5 modal-overlay" onClick={handleOverlayClick} style={{zIndex:998}}>
          <div id="modalContainerOuter" style={{height:770+"px", width:400+"px"}}>
          <div id="modalContainer" className="bg-[#a8daf7] relative top-1 x-2 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(60%-1rem)] gpsModal-content dark:bg-[#81b7d7]">
            <button className="hover:bg-[#7acaf8] hover:text-gray-200 hover:shadow-gray-400 dark:hover:bg-[#65c3f9] shadow-md z-50 pb-3 pt-3 modal-close dark:text-white ml-60 pr-3 pl-3 font-bold bg-[#c7e6f8] dark:bg-[#57aada]  text-[#57aada] rounded-md" onClick={() => {onClose()}}>
              Close
            </button>
            {/* {children} */}
            <div id="makeNewGroupModal" className="bg-[#a8daf7] dark:bg-[#81b7d7]  absolute top-6 pb-4 pt-4">
            <p className="font-bold text-center text-lg dark:text-[#3f82a9] text-[#4893be]"><strong>Make a group</strong></p>
              <div id="newGroupForm">
              <form onSubmit={handleSubmitNewGP} className=" bg-[#a8daf7] dark:bg-[#81b7d7]">
                <br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Group name:
                <input type="text" name="grpName" valuechkJoin={newGroupInputs.grpName || ""} onChange={handleNewGP} placeholder="Enter group name" className="border-hidden mb-6 ml-6 bg-[#c7e6f8] dark:bg-[#90d0f5] w-[calc(50%-1rem)] rounded-md" id="grpName" required />
                </label><br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Description:
                <input type="text" name="grpDescr" value={newGroupInputs.grpDescr || ""} onChange={handleNewGP} placeholder="Enter description" className="border-hidden mb-6 ml-6 bg-[#c7e6f8] dark:bg-[#90d0f5] w-[calc(70%-1rem)] rounded-md" id="grpDescr" required/>
                </label>
                <p className="ml-2 text-[#717575] dark:text-white">Invite group members:</p>
                  <br></br>
                  {console.log("followers inside the GroupsModal component: ",followers)}
                  <ul className="flex space-x-4"> 
                    {followers == null ? <label class="addToGroup dark:text-[#3f82a9]">Group membership is restricted to followers </label> : followers.map((follw) => (
                  <li key={follw}>
                    <input class="chk" name={follw} type="checkbox" onChange={handleNewGP} border="hidden" background-color="white" className="rounded-sm h-4 w-4 ml-1 cursor-pointer accent-[#57aada]"/>
                    <label class="addToGroup dark:text-[#3f82a9]">{follw}</label>
                  </li>
                ))}
                  </ul>
                <div id="addFollowersToGroup" className="text-sm font-sm text-[#717575] dark:text-primary-500">
               
                </div>
                <div>
                <input type="submit" id="newGpSubmit" value="Create group"
                  className="mt-2 cursor-pointer absolute justify-center flex items-center p-2 w-[calc(35%-1rem)] text-base font-medium text-white 
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
                <div id="joinGrp">
                <form id="joinGP" onSubmit={handleSubmitJoinGP}>
                {console.log("allGroups inside the GroupsModal component: ", allGroups)}
                  <ul>
                    {(parseInt(allGroups.nbGroups, 10) || 0) === 0 ? (
                      <label className="allGroups text-[#4893be] dark:text-[#3f82a9]">There are no groups available</label>
                      ) : (
                        allGroups.sliceOfGroups.map((grp) => (
                        <span key={grp.id}>
                        <li className="py-2 px-2 text-ml hover:bg-[#c7e6f8] dark:hover:bg-[#5a9fc6] dark:hover:text-[#2f627f] flex space-x-4">
                        
                        {console.log("the value of grpMemberis: ",grpMember)}
                        {console.log("the value of request, creator, and grp.gpMembers is: ",request, grp.creator, grp.gpMembers)}
                        {request != grp.creator && grp.gpMembers === null || request != grp.creator && grp.gpMembers.includes(request) === false ?  (
                        <input
                        name={grp.id}
                        type="checkbox"
                        onChange={handleJoinGP}
                        className="chkJoin h-4 w-4 bg-white mt-1 ml-1 cursor-pointer accent-[#57aada]"
                        />
            
                        ) : (
                        <div className="isMember flex space-x-4"></div>
                        )}
                        <p
                        style={{ cursor: 'pointer' }}
                        id="selectedGrp"
                        onClick={() => {
                          {console.log("who is the group creator", grp.creator, request)}
                        grp.gpMembers === null || (grp.creator != request && grp.gpMembers.includes(request) === false) ? setGrpMember(false): setGrpMember(true)
                        handleOpenGpProfile();
                        handleSelectGrp(grp);
                        }}
                        className="addToGroup font-bold dark:text-[#3f82a9] dark:hover:text-[#2f627f]"
                        >
                        {grp.grpName}
                        </p>
                        <p className="dark:text-white text-[#717575]">{grp.grpDescr}</p>
                        </li>
                        </span>
                        ))
                        )}
                  </ul>

                  <div>
                  <br></br>
                  <input type="submit" id="joinGpSubmit" value="Join group" style={{marginBottom:10+"px"}}
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
        </div>
      );
}

export default GroupsModal;