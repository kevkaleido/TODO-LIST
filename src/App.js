import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import TodoList from './components/TodoList';
import HistoryList from './components/HistoryList';
import SignIn from './components/SignIn';
import Login from './components/Login';
import HamburgerMenu from './components/HamburgerMenu';
import ChatComponent from './components/ChatComponent';
import './styles.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatContext, setChatContext] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
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

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const historyToggleText = showHistory ? "Show Tasks" : "Show History";

  const startChat = (item) => {
    setChatContext({
      id: item.id,
      type: item.completed !== undefined ? 'todo' : 'history',
      text: item.text,
      completed: item.completed
    });
  };

  const AppContent = () => {
    const location = useLocation();
    const showHamburgerMenu = user && location.pathname !== '/signin' && location.pathname !== '/login';

    return (
      <div id="app">
        {showHamburgerMenu && (
          <HamburgerMenu 
            isAuthenticated={!!user} 
            userEmail={user ? user.email : null}
            onLogout={handleLogout}
            onClearAllTodos={clearAllTodos}
            onClearAllHistory={clearAllHistory}
            onShowSignIn={() => {}}
            onShowLogin={() => {}}
            onToggleHistory={toggleHistory}
            historyToggleText={historyToggleText}
            showHistory={showHistory}
          />
        )}

        <h1>wo2do</h1>

        <Routes>
          <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={
            user ? (
              showHistory ? (
                <>
                  <h2>History</h2>
                  <HistoryList userId={user.uid} onStartChat={startChat} />
                </>
              ) : (
                <TodoList userId={user.uid} onStartChat={startChat} />
              )
            ) : (
              <div className="home-buttons">
                <Link to="/signin"><button>SignIn</button></Link>
                <Link to="/login"><button>Login</button></Link>
              </div>
            )
          } />
          <Route path="/chat" element={
            user ? <ChatComponent userId={user.uid} chatContext={chatContext} /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    );
  };

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
