// src/components/HistoryList.js
import React, { useState } from 'react';
import Modal from './Modal';

/**
 * HistoryList Component
 * @param {Array} history - List of history items
 * @param {function} clearHistory - Function to clear the history
 */
const HistoryList = ({ history, clearHistory }) => {
  const [showModal, setShowModal] = useState(false); // State to show/hide modal

  // Show confirmation modal before clearing history
  const handleClearHistory = () => {
    setShowModal(true);
  };

  // Handle confirmed clearing of the history list
  const handleConfirmClear = () => {
    clearHistory();
    setShowModal(false);
  };

  return (
    <div>
      <ul className={history.length > 3 ? 'scrollable' : ''}>
        {history.map((item, index) => (
          <li className="historyList" key={index}>
            {item.text}
            <br />
            <small>{item.timestamp}</small>
          </li>
        ))}
      </ul>
      <button onClick={handleClearHistory}>Clear History</button>

      <Modal
        show={showModal}
        title="Confirm"
        message="Are you sure you want to clear history list?"
        onConfirm={handleConfirmClear}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default HistoryList;
