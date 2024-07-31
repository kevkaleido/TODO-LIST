import React, { useState } from 'react';
import '../HamburgerMenu.css'; // Create corresponding CSS file for styling

const HamburgerMenu = ({ isAuthenticated, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div>
      <div className="hamburger" onClick={toggleMenu}>
        ☰
      </div>
      <div className={`menu ${isOpen ? 'open' : ''}`}>
        {isAuthenticated ? (
          <div onClick={onLogout}>Logout</div>
        ) : (
          <>
            <div>Sign In</div>
            <div>Login</div>
          </>
        )}
      </div>
    </div>
  );
};

export default HamburgerMenu;
