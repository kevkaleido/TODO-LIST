import React, { useState, useEffect, useCallback } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import TodoList from './components/TodoList';
import HistoryList from './components/HistoryList';
import HamburgerMenu from './components/HamburgerMenu';
import SignIn from './components/SignIn';
import Login from './components/Login';
import './styles.css';

const formatDateTime = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = String(date.getFullYear()).slice(-2); // Get last two digits of year
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Adjust hours for 12-hour format
  
  return `${formattedHours}:${minutes} ${ampm} ${day}/${month}/${year}`;
};

const App = () => {
  const [todos, setTodos] = useState([]);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };
  
  const addTodo = useCallback((todo) => {
    const timestamp = formatDateTime(new Date());
    setTodos((prevTodos) => [{ text: todo, completed: false, timestamp }, ...prevTodos]);
  }, []);

  const removeTodo = useCallback((index) => {
    setTodos((prevTodos) => {
      const newTodos = [...prevTodos];
      const [removedTodo] = newTodos.splice(index, 1);

      const currentTimestamp = formatDateTime(new Date());
      const updatedTodo = { ...removedTodo, timestamp: currentTimestamp };
      setHistory((prevHistory) => [updatedTodo, ...prevHistory]);

      return newTodos;
    });
  }, []);

  const toggleComplete = useCallback((index) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo, i) =>
        i === index ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const clearSelectedHistory = useCallback((selectedIndices) => {
    setHistory((prevHistory) =>
      prevHistory.filter((_, index) => !selectedIndices.includes(index))
    );
  }, []);

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div id="app">
      <HamburgerMenu isAuthenticated={!!user} onLogout={handleLogout} />
      <h1>wo2do</h1>
      {user ? (
        <>
          <TodoList todos={todos} addTodo={addTodo} removeTodo={removeTodo} toggleComplete={toggleComplete} />
          <h2>History</h2>
          <HistoryList history={history} clearSelectedHistory={clearSelectedHistory} />
        </>
      ) : (
        <>
          {isSignUp ? <SignIn /> : <Login />}
          <button onClick={toggleAuthMode}>
            {isSignUp ? 'Already have an account? Login' : 'New here? Sign Up'}
          </button>
        </>
      )}
    </div>
  );
};

export default App;
