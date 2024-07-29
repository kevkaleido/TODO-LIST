// src/App.js
import React, { useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import HistoryList from './components/HistoryList';
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
  const [todos, setTodos] = useState(JSON.parse(localStorage.getItem('todos')) || []);
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('history')) || []);

  // Sync todos with localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Sync history with localStorage
  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  // Add a new todo item with a timestamp
  const addTodo = (todo) => {
    const timestamp = formatDateTime(new Date());
    setTodos([{ text: todo, completed: false, timestamp }, ...todos]);
  };

  // Remove a todo item and add it to history with a new timestamp
  const removeTodo = (index) => {
    const newTodos = [...todos];
    const [removedTodo] = newTodos.splice(index, 1);
    setTodos(newTodos);

    const currentTimestamp = formatDateTime(new Date());
    const updatedTodo = { ...removedTodo, timestamp: currentTimestamp };
    setHistory([updatedTodo, ...history]);
  };

  // Toggle the completion status of a todo item
  const toggleComplete = (index) => {
    const newTodos = todos.map((todo, i) => 
      i === index ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(newTodos);
  };

  // Clear selected history items
  const clearSelectedHistory = (selectedIndices) => {
    setHistory((prevHistory) =>
      prevHistory.filter((_, index) => !selectedIndices.includes(index))
    );
  };

  return (
    <div id="app">
      <h1>wo2do</h1>
      <TodoList todos={todos} addTodo={addTodo} removeTodo={removeTodo} toggleComplete={toggleComplete} />
      <h2>History</h2>
      <HistoryList history={history} clearSelectedHistory={clearSelectedHistory} />
    </div>
  );
};

export default App;
