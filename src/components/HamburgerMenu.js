import React, { useState } from 'react';
import Modal from './Modal';
import '../HamburgerMenu.css';

const HamburgerMenu = ({ isAuthenticated, onLogout, onClearAllTodos, onClearAllHistory, onShowSignIn, onShowLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', onConfirm: null });

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleClearAllTodos = () => {
    setModalContent({
      title: "Clear All Todos",
      message: "Are you sure you want to clear all todo items? You can't revert this.",
      onConfirm: () => {
        onClearAllTodos();
        setShowModal(false);
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
      }
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="hamburger" onClick={toggleMenu}>
        ☰
      </div>
      <div className={`menu ${isOpen ? 'open' : ''}`}>
        {isAuthenticated ? (
          <>
            <div onClick={handleClearAllTodos}>Clear All Todos</div>
            <div onClick={handleClearAllHistory}>Clear All History</div>
            <div onClick={handleLogout}>Logout</div>
          </>
        ) : (
          <>
            <div onClick={onShowSignIn}>Sign In</div>
            <div onClick={onShowLogin}>Login</div>
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