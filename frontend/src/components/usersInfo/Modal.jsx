
import React from "react";
import  {Posts} from "./../feed/Posts.jsx";
//This is the modal component for the <Card/> component that is used to display user info

function Modal({ children, onClose, onFollow, influencer, user}) {
 
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const checkFollow = () => {
    if(user.influencer === 1 ){ 
    return "Yes"
    } else if (user.influencer === 2) { 
    return `Awaiting ${user.name} reply`
    } else {
    return "No"
    };
}

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
     <div className="dark:bg-gray-600 w-3/4 bg-white p-4 m-6 position-relative overflow-auto max-h-screen min-h-min min-w-fit"> 
        <button className="modal-close dark:text-white" onClick={() => {onClose()}} classn="ml-60  pl-5 pr-5 font-bold bg-[#00cec9] text-[#255f5a] rounded-md">
          Close
        </button>
        {children}
        <button 
        id="follow" 
        onClick={()=> {onFollow()}} 
        className={`"ml-5 m-2.5 pl-5 pr-5 font-bold rounded-lg shadow-lg" ${
            influencer === 1 ? "bg-[#6f97af] text-white" : "bg-[#96ccec] text-white"
          }`}
        >
          {influencer === 1 ? "Un-follow" : "Follow"}
        </button>
        {user.profVisib == 'public' || checkFollow() == 'Yes' ? 
        <div>
          <Posts page={"myProfile"} username={user.username}/> 
        </div>
        
        : null }
        
      </div>
    </div>
  );
}

export default Modal;