import React from "react";

function Modal({ children, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content dark:bg-gray-600">
        <button className="modal-close" onClick={onClose} class="ml-60  pl-5 pr-5 font-bold bg-gray-500 text-white rounded-md">
          Close
        </button>
        {children}
        <button className="modal-follow" onClick={onClose} class="ml-5 m-2.5 pl-5 pr-5 font-bold bg-blue-500 text-white rounded-md">
          Follow
        </button>
      </div>
    </div>
  );
}

export default Modal;
