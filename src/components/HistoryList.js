import React, { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

const HistoryList = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      const q = query(
        collection(db, 'history'),
        where('userId', '==', userId),
        orderBy('removedAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const historyData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            removedAt: doc.data().removedAt ? doc.data().removedAt.toDate() : new Date()
          }));
          setHistory(historyData);
        },
        (error) => {
          console.error("Error fetching history:", error);
          setError("Failed to fetch history. Please check your connection and try again.");
        }
      );
      return () => unsubscribe();
    }
  }, [userId]);

  const handleClearHistory = () => {
    if (selectedItems.length > 0) {
      setShowModal(true);
    }
  };

  const handleConfirmClear = async () => {
    try {
      for (const id of selectedItems) {
        await deleteDoc(doc(db, 'history', id));
      }
      setShowModal(false);
      setSelectedItems([]);
      setError(null);
    } catch (error) {
      console.error("Error clearing history:", error);
      setError("Failed to clear history. Please try again.");
    }
  };

  const toggleSelection = (id) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((item) => item !== id)
        : [...prevSelectedItems, id]
    );
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <ul className={history.length > 3 ? 'scrollable' : ''}>
        {history.map((item) => (
          <li
            className={`historyList ${selectedItems.includes(item.id) ? 'selected' : ''}`}
            key={item.id}
            onClick={() => toggleSelection(item.id)}
          >
            {item.text}
            <br />
            <small>
              {item.removedAt instanceof Date 
                ? item.removedAt.toLocaleString()
                : 'Processing...'}
            </small>
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