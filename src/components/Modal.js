// src/components/Modal.js
import React from 'react';
import PropTypes from 'prop-types';
import '../modal.css';

/**
 * Modal Component
 * @param {boolean} show - Whether the modal is visible
 * @param {string} title - The title of the modal
 * @param {string} message - The message displayed in the modal
 * @param {function} onConfirm - Function to call on confirming action
 * @param {function} onClose - Function to call on closing the modal
 */
const Modal = ({ show, title, message, onConfirm, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// PropTypes for type checking
Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
