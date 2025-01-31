import React from "react";
import "./Modal.css"; // Import the CSS for the modal

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
        <div className="modal-actions">
          <button onClick={onClose} className="modal-close">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
