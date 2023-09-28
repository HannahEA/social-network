import React from "react";


function GroupsModal({closeGroups}){
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
          closeGroups();
        }
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
              <form>
                <label className="text-[#717575] dark:text-white">Group name:
                <input id="name" type="text" placeholder="Enter group name" className="mb-6 ml-6 bg-gray-100 w-[calc(50%-1rem)] rounded-md"/>
                </label><br></br>
                <label className="text-[#717575] dark:text-white">Description:
                <input id="descr" type="text" placeholder="Enter description" className="mb-6 ml-6 bg-gray-100 w-[calc(70%-1rem)] rounded-md"/>
                </label>
              </form>
              </div>
              <hr class="dottedL"></hr>
              <div id="addFollowersToGroup" className="text-sm font-sm text-[#717575] dark:text-primary-500">
              <br></br>
                <p>Invite group members:</p>
                <br></br>
                <ul>
                  <li >Jackie Bouvier <a style={{cursor: 'pointer'}} class="addToGroup">Invite</a></li>
                  <li>Lee Bouvier <a style={{cursor: 'pointer'}} class="addToGroup">Invite</a></li>
                  <li>Arabella Bouvier <a style={{cursor: 'pointer'}} class="addToGroup">Invite</a></li>
                </ul>
              </div>
              <button id="newGpBtn"
                className="absolute justify-center flex items-center p-2 w-[calc(40%-1rem)] text-base font-medium text-white 
                rounded-lg transition duration-75 group bg-[#57aada] hover:bg-[#4488af] 
                shadow-lg dark:text-white dark:hover:bg-[#4488af]
                [box-shadow:0_3px_0_0_#407da1]"
            // onClick={()=> {onFollow()}} 
            // className={`"ml-5 m-2.5 pl-5 pr-5 font-bold rounded-lg shadow-lg" ${
              //   influencer === 1 ? "bg-[#6f97af] text-white" : "bg-[#96ccec] text-white"
              // }`}
              >
                Create group
              {/* {influencer === 1 ? "Un-follow" : "Follow"} */}
              </button>
              
            </div>
            
          </div>
          
        </div>
      );

}

export default GroupsModal;