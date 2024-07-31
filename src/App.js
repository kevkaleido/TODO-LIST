import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import TodoList from './components/TodoList';
import HistoryList from './components/HistoryList';
import SignIn from './components/SignIn';
import Login from './components/Login';
import HamburgerMenu from './components/HamburgerMenu';
import './styles.css';

const App = () => {
  const [user, setUser] = useState(null);
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

  const clearAllTodos = async () => {
    if (user) {
      const q = query(collection(db, 'todos'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref);
      });
    }
  };

  const clearAllHistory = async () => {
    if (user) {
      const q = query(collection(db, 'history'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref);
      });
    }
  };

  const showSignInForm = () => {
    setShowSignIn(true);
    setShowLogin(false);
  };

  const showLoginForm = () => {
    setShowLogin(true);
    setShowSignIn(false);
  };

  return (
    <div id="app">
      <HamburgerMenu 
        isAuthenticated={!!user} 
        onLogout={handleLogout}
        onClearAllTodos={clearAllTodos}
        onClearAllHistory={clearAllHistory}
        onShowSignIn={showSignInForm}
        onShowLogin={showLoginForm}
      />

      <h1>wo2do</h1>

      {!user && (
        <>
          {showSignIn && <SignIn />}
          {showLogin && <Login />}
          {!showSignIn && !showLogin && (
            <div>
              <button onClick={showSignInForm}>Sign In</button>
              <button onClick={showLoginForm}>Login</button>
            </div>
          )}
        </>
      )}

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