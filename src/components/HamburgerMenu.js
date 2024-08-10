import React, { useState } from 'react';
import Modal from './Modal';
import '../HamburgerMenu.css';

const HamburgerMenu = ({ isAuthenticated, userEmail, onLogout, onClearAllTodos, onClearAllHistory, onShowSignIn, onShowLogin, onToggleHistory, historyToggleText, showHistory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    onConfirm: () => {} // Initialize with an empty function instead of null
  });

  console.log("HamburgerMenu rendered. isAuthenticated:", isAuthenticated, "userEmail:", userEmail);

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
            <div onClick={() => { onToggleHistory(); setIsOpen(false); }}>{historyToggleText}</div>
            <div onClick={handleClearAllTodos}>Clear All Todos</div>
            {showHistory && <div onClick={handleClearAllHistory}>Clear All History</div>}
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
