// src/components/HistoryList.js
import React, { useState } from 'react';
import Modal from './Modal';

/**
 * HistoryList Component
 * @param {Array} history - List of history items
 * @param {function} clearSelectedHistory - Function to clear the selected history items
 */
const HistoryList = ({ history, clearSelectedHistory }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Show confirmation modal with selected items
  const handleClearHistory = () => {
    if (selectedItems.length > 0) {
      setShowModal(true);
    }
  };

  // Handle confirmed clearing of the selected history items
  const handleConfirmClear = () => {
    clearSelectedHistory(selectedItems);
    setShowModal(false);
    setSelectedItems([]);
  };

  // Toggle selection of a history item
  const toggleSelection = (index) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(index)
        ? prevSelectedItems.filter((item) => item !== index)
        : [...prevSelectedItems, index]
    );
  };

  return (
    <div>
      <ul className={history.length > 3 ? 'scrollable' : ''}>
        {history.map((item, index) => (
          <li
            className={`historyList ${selectedItems.includes(index) ? 'selected' : ''}`}
            key={index}
            onClick={() => toggleSelection(index)}
          >
            {item.text}
            <br />
            <small>{item.timestamp}</small>
          </li>
        ))}
      </ul>
      <button onClick={handleClearHistory}>X</button>

      <Modal
        show={showModal}
        title="Confirm"
        message="Sure you want to clear selected task(s) from history?"
        onConfirm={handleConfirmClear}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default HistoryList;
