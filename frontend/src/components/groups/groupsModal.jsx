import React from "react";
import { useState } from 'react';


function GroupsModal({closeGroups}){
  // to close the groups modal
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
          closeGroups();
        }
      };

    //store new group form inputs
    const [newGroupInputs, setNewGroupInputs] = useState({});
    const [isChecked, setIsChecked] = useState(false);
    //collect new group form's info
    const handleChange = (event) => {
      const {name, value} = event.target;
      setNewGroupInputs({...newGroupInputs, [name]: value})


    }
  
    //process user inputs for new group
    const handleSubmit = (event) => {
      event.preventDefault();
      document.getElementById("grpName").value = ""; // Clear the input value
      document.getElementById("grpDescr").value = ""; // Clear the input value
      let theChks = document.querySelectorAll(".chk"); 
      for (let i=0; i<theChks.length; i++){
        theChks[i].value = setIsChecked(false); //clear the check boxes next to group invitees
      }
      alert(JSON.stringify(newGroupInputs, null, 2)); // Convert to JSON string for display; the second argument null is for replacer function, and the third argument 2 is for indentation

    };
    

      
      return (
        <div id="modalOverly" className="modal-overlay" onClick={handleOverlayClick}>
          <div id="modalContainer" className="bg-[#a8daf7] relative top-1 x-3 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(60%-1rem)] gpsModal-content dark:bg-gray-600">
            <button className="hover:bg-[#f3bca1] hover:text-gray-200 hover:shadow-gray-400 shadow-md z-50 pb-3 pt-3 modal-close dark:text-white ml-60 pr-3 pl-3 font-bold bg-[#c7e6f8] text-[#57aada] rounded-md" onClick={() => {closeGroups()}}>
              Close
            </button>
            {/* {children} */}
            <div id="makeNewGroupModal" className="bg-[#a8daf7]  absolute top-6 pb-4 pt-4">
            <p className="font-bold text-center text-lg dark:text-white text-[#4893be]"><strong>Create new group</strong></p>
              <div id="newGroupForm">
              <form onSubmit={handleSubmit} className="bg-[#a8daf7]">
                <br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Group name:
                <input type="text" name="grpName" value={newGroupInputs.grpName || ""} onChange={handleChange} placeholder="Enter group name" className="border-hidden mb-6 ml-6 bg-[#c7e6f8] w-[calc(50%-1rem)] rounded-md" id="grpName"/>
                </label><br></br>
                <label className="ml-2 text-[#717575] dark:text-white">Description:
                <input type="text" name="grpDescr" value={newGroupInputs.grpDescr || ""} onChange={handleChange} placeholder="Enter description" className="border-hidden mb-6 ml-6 bg-[#c7e6f8] w-[calc(70%-1rem)] rounded-md" id="grpDescr"/>
                </label>
                <p className="ml-2 text-[#717575] dark:text-white">Invite group members:</p>
                  <br></br>
                <ul className="flex space-x-4">
                  <li>
                    <input class="chk" name="Jackie" type="checkbox" defaultChecked={isChecked} onChange={handleChange} border="hidden" background-color="white" className="rounded-sm h-4 w-4 ml-1 cursor-pointer accent-[#57aada]"/>
                    <label class="addToGroup">Jackie</label>
                  </li>
                  <li>
                    <input class="chk" name="Arabella"  type="checkbox" defaultChecked={isChecked} onChange={handleChange} border="hidden" background-color="white" className="h-4 w-4 ml-1 cursor-pointer accent-[#57aada] "/>
                    <label class="addToGroup">Arabella</label>
                  </li>
                  <li>
                    <input class="chk" name="Lee"  type="checkbox" defaultChecked={isChecked} onChange={handleChange} border="hidden" className="h-4 w-4 bg-white ml-1 cursor-pointer accent-[#57aada] "/>
                    <label class="addToGroup">Lee</label>
                  </li>
                </ul>
                <div id="addFollowersToGroup" className="text-sm font-sm text-[#717575] dark:text-primary-500">
                </div>
                <input type="submit" id="newGpSubmit"
                  className="cursor-pointer absolute justify-center flex items-center p-2 w-[calc(40%-1rem)] text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#57aada] hover:bg-[#4c97c2] hover:text-[#c2e5f9]
                  shadow-lg dark:text-white dark:hover:bg-[#4488af]
                  [box-shadow:0_3px_0_0_#407da1]"
                />
              </form>
              </div>
              <br></br>
              <br></br>
              <br></br>

              
              <hr class="dottedL"></hr>
              <div >
              <br></br>
              <p className="font-bold text-lg text-center dark:text-white text-[#4893be]">Groups</p>
                <br></br>
                <div>
                  <ul>
                  <span><li className="py-2 px-4 text-ml hover:bg-[#c7e6f8] dark:hover:bg-[#7096ac] flex space-x-4"><p style={{cursor: 'pointer'}} class="addToGroup font-bold">Friends of happiness </p>
                  <p  className="dark:text-white text-[#717575]"> Antisocial social club</p></li></span>
                  <span><li className="py-2 px-4 text-ml hover:bg-[#c7e6f8] dark:hover:bg-[#7096ac] flex space-x-4"><p style={{cursor: 'pointer'}} class="addToGroup font-bold">Band of saints</p>
                  <p  className="dark:text-white text-[#717575]">- Antisocial social club</p></li></span>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
}

export default GroupsModal;