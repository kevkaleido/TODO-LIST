import React, { useState, useEffect } from 'react';
import TodoList from './TodoList';
import HistoryList from './HistoryList';
import './styles.css';

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
    const timestamp = new Date().toLocaleString();
    setTodos([{ text: todo, completed: false, timestamp }, ...todos]);
  };
  
  // Remove a todo item and add it to history with a new timestamp
  const removeTodo = (index) => {
    const newTodos = [...todos];
    const [removedTodo] = newTodos.splice(index, 1);
    setTodos(newTodos);
    
    const currentTimestamp = new Date().toLocaleString();
    const updatedTodo = { ...removedTodo, timestamp: currentTimestamp };
    setHistory([updatedTodo, ...history]);
  };

  // Toggle the completion status of a todo item
  const toggleComplete = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

  // Clear the history list
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div id="app">
      <h1>2do</h1>
      <TodoList todos={todos} addTodo={addTodo} removeTodo={removeTodo} toggleComplete={toggleComplete} />
      <h2>What got done</h2>
      <HistoryList history={history} clearHistory={clearHistory} />
    </div>
  );
};

export default App;
