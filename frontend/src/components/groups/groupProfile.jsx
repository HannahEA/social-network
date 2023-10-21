
import React from "react";
//this is the modal that contains a group's profile

function GroupProfile({ children, onGpClose}) {
 
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onGpClose();
    }
  };


  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
     <div className="dark:bg-gray-600 w-3/4 bg-white p-4 m-6 position-relative overflow-auto max-h-screen min-h-min min-w-fit"> 
        
        <button className="modal-close text-white dark:text-white" onClick={() => {onGpClose()}} classn="ml-60  pl-5 pr-5 font-bold bg-[#00cec9] text-[#255f5a] rounded-md">
          Close
        </button>
        {children}
      </div>
    </div>
  );
}

export default GroupProfile;