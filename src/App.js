import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import TodoList from './components/TodoList';
import HistoryList from './components/HistoryList';
import SignIn from './components/SignIn';
import Login from './components/Login';
import './styles.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowSignIn(false);
      setShowLogin(false);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div id="app">
      <div className="hamburger-menu" onClick={toggleMenu}>
        &#9776; {/* Hamburger icon */}
      </div>
      {showMenu && (
        <div className="menu">
          {user ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <button onClick={() => { setShowSignIn(true); setShowLogin(false); setShowMenu(false); }}>Sign In</button>
              <button onClick={() => { setShowLogin(true); setShowSignIn(false); setShowMenu(false); }}>Login</button>
            </>
          )}
        </div>
      )}

      <h1>wo2do</h1>

      {showSignIn && !user && <SignIn />}
      {showLogin && !user && <Login />}

      {user && (
        <>
          <TodoList userId={user.uid} />
          <h2>History</h2>
          <HistoryList userId={user.uid} />
        </>
      )}
    </div>
  );
};

export default App;