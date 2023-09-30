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
      alert(JSON.stringify(newGroupInputs, null, 2)); // Convert to JSON string for display; the second argument null is for replacer function, and the third argument 2 is for indentation

    };
    

      
      return (
        <div id="modalOverly" className="modal-overlay" onClick={handleOverlayClick}>
          <div id="modalContainer" className="relative top-1 x-3 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(60%-1rem)] modal-content dark:bg-gray-600">
            <button className="pb-4 pl-2 modal-close dark:text-white ml-60 pr-5 font-bold bg-gray-400 text-[#255f5a] rounded-md" onClick={() => {closeGroups()}}>
              Close
            </button>
            {/* {children} */}
            <div id="makeNewGroupModal" className="absolute top-6 pb-4 pt-4">
              <div id="newGroupForm">
              <form onSubmit={handleSubmit}>
                <label className="text-[#717575] dark:text-white">Group name:
                <input type="text" name="grpName" value={newGroupInputs.grpName || ""} onChange={handleChange} placeholder="Enter group name" className="mb-6 ml-6 bg-gray-100 w-[calc(50%-1rem)] rounded-md" id="grpName"/>
                </label><br></br>
                <label className="text-[#717575] dark:text-white">Description:
                <input type="text" name="grpDescr" value={newGroupInputs.grpDescr || ""} onChange={handleChange} placeholder="Enter description" className="mb-6 ml-6 bg-gray-100 w-[calc(70%-1rem)] rounded-md" id="grpDescr"/>
                </label>
                <p className="text-[#717575] dark:text-white">Invite group members</p>

                <ul>
                  <li >Jackie Bouvier <a style={{cursor: 'pointer'}} class="addToGroup">Invite</a></li>
                  <li>Lee Bouvier <a style={{cursor: 'pointer'}} class="addToGroup">Invite</a></li>
                  <li>Arabella Bouvier <a style={{cursor: 'pointer'}} class="addToGroup">Invite</a></li>
                </ul>
                <div id="addFollowersToGroup" className="text-sm font-sm text-[#717575] dark:text-primary-500">
                </div>
                <input type="submit" id="newGpSubmit"
                  className="absolute justify-center flex items-center p-2 w-[calc(40%-1rem)] text-base font-medium text-white 
                  rounded-lg transition duration-75 group bg-[#57aada] hover:bg-[#4488af] 
                  shadow-lg dark:text-white dark:hover:bg-[#4488af]
                  [box-shadow:0_3px_0_0_#407da1]"
                />
              </form>
              </div>
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <hr class="dottedL"></hr>
              <br></br>
              <p className="text-[#717575] dark:text-white">Groups</p>
            </div>
          </div>
        </div>
      );
}

export default GroupsModal;