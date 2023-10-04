
import React from "react";
import  {Posts} from "./../feed/Posts.jsx";

function Modal({ children, onClose, onFollow, influencer, name}) {
  console.log("name from modal", name)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  return (
    <div className="modal-overlay dark:bg-gray-600" onClick={handleOverlayClick}>
     <div className="dark:bg-gray-600 w-auto bg-white p-4 m-6 position-relative overflow-auto max-h-screen min-h-min min-w-max"> 
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
        <Posts page={"myProfile"} username={name}/>
      </div>
    </div>
  );
}

export default Modal;