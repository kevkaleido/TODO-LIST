import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import '../HamburgerMenu.css';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const HamburgerMenu = ({ isAuthenticated, userEmail, onLogout, onClearAllTodos, onClearAllHistory, onShowSignIn, onShowLogin, onToggleHistory, historyToggleText, showHistory }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const q = query(
        collection(db, 'messages'),
        where('read', '==', false)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setUnreadMessages(querySnapshot.size);
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated]);


  const toggleMenu = () => setIsOpen(!isOpen);

  const handleClearAllTodos = () => {
    setModalContent({
      title: "Clear All Todos",
      message: "Are you sure you want to clear all todo items? You can't revert this.",
      onConfirm: () => {
        onClearAllTodos();
        setShowModal(false);
        setIsOpen(false);
      }
    });
    setShowModal(true);
  };

  const handleClearAllHistory = () => {
    setModalContent({
      title: "Clear All History",
      message: "Are you sure you want to clear all history items? You can't revert this.",
      onConfirm: () => {
        onClearAllHistory();
        setShowModal(false);
        setIsOpen(false);
      }
    });
    setShowModal(true);
  };

  const handleLogout = () => {
    setModalContent({
      title: "Logout",
      message: "Are you sure you want to log out?",
      onConfirm: () => {
        onLogout();
        setShowModal(false);
        setIsOpen(false);
      }
    });
    setShowModal(true);
  };

  const handleSignIn = () => {
    onShowSignIn();
    setIsOpen(false);
  };

  const handleLogin = () => {
    onShowLogin();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleAuthSuccess = (event) => {
      setIsOpen(false);
      if (event.detail.type === 'login') {
        // Handle login-specific actions if needed
      } else if (event.detail.type === 'signin') {
        // Handle signin-specific actions if needed
      }
    };

    window.addEventListener('auth-success', handleAuthSuccess);
    return () => {
      window.removeEventListener('auth-success', handleAuthSuccess);
    };
  }, []);

  const handleToggleHistory = () => {
    onToggleHistory();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div>
      <div className="hamburger" onClick={toggleMenu}>
        ☰
      </div>
      <div className={`menu ${isOpen ? 'open' : ''}`}>
        {isAuthenticated ? (
          <>
            <div className="user-email-container">
              <strong>{userEmail || 'Email not available'}</strong>
            </div>
            <div onClick={handleToggleHistory}>{historyToggleText}</div>
            {!showHistory && <div onClick={handleClearAllTodos}>Clear All Todos</div>}
            {showHistory && <div onClick={handleClearAllHistory}>Clear All History</div>}
            <Link to="/chat" onClick={() => setIsOpen(false)}>
              Chat {unreadMessages > 0 && <span className="notification">{unreadMessages}</span>}
            </Link>
            <div onClick={handleLogout}>Logout</div>
          </>
        ) : (
          <>
            <div onClick={handleSignIn}>Sign In</div>
            <div onClick={handleLogin}>Login</div>
          </>
        )}
      </div>
      <Modal
        show={showModal}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={modalContent.onConfirm}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default HamburgerMenu;
