import React, { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';

const HistoryList = ({ userId, onStartChat }) => {
  const navigate = useNavigate();
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
          if (error.code === 'failed-precondition') {
            setError("This query requires an index. Please check the console for the link to create it.");
          } else {
            setError("Failed to fetch history. Please check your connection and try again.");
          }
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

  const formatDate = (date) => {
    if (!(date instanceof Date)) return 'Processing...';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  const renderLink = (link) => {
    if (!link) return null;
    return (
      <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={(e) => e.stopPropagation()}
      >
        Link
      </a>
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
            {item.link && (
              <>
                <br />
                {renderLink(item.link)}
              </>
            )}
            <br />
            <small>{formatDate(item.removedAt)}</small>
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
