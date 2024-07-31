import React, { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

const HistoryList = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (userId) {
      const q = query(collection(db, 'history'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(historyData);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const handleClearHistory = () => {
    if (selectedItems.length > 0) {
      setShowModal(true);
    }
  };

  const handleConfirmClear = async () => {
    for (const id of selectedItems) {
      await deleteDoc(doc(db, 'history', id));
    }
    setShowModal(false);
    setSelectedItems([]);
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
      <ul className={history.length > 3 ? 'scrollable' : ''}>
        {history.map((item) => (
          <li
            className={`historyList ${selectedItems.includes(item.id) ? 'selected' : ''}`}
            key={item.id}
            onClick={() => toggleSelection(item.id)}
          >
            {item.text}
            <br />
            <small>{new Date(item.timestamp).toLocaleString()}</small>
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