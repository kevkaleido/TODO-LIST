// src/components/TodoList.js
import React, { useState } from 'react';
import Modal from './Modal';

/**
 * TodoList Component
 * @param {Array} todos - List of todo items
 * @param {function} addTodo - Function to add a new todo
 * @param {function} removeTodo - Function to remove a todo
 * @param {function} toggleComplete - Function to toggle completion status of a todo
 */
const TodoList = ({ todos, addTodo, removeTodo, toggleComplete }) => {
  const [newTodo, setNewTodo] = useState(''); // State for new todo input
  const [showModal, setShowModal] = useState(false); // State to show/hide modal
  const [todoToRemove, setTodoToRemove] = useState(null); // State to keep track of the todo to be removed

  // Add a new todo item if it's not empty and not a duplicate
  const handleAddTodo = () => {
    if (newTodo.trim() !== '' && !todos.some(todo => todo.text === newTodo.trim())) {
      addTodo(newTodo.trim());
      setNewTodo(''); // Clear input after adding
    }
  };

  // Handle pressing Enter key to add a new todo item
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  // Show confirmation modal before removing a todo
  const confirmRemoveTodo = (index) => {
    setTodoToRemove(index);
    setShowModal(true);
  };

  // Handle confirmed removal of a todo item
  const handleConfirmRemove = () => {
    if (todoToRemove !== null) {
      removeTodo(todoToRemove);
      setTodoToRemove(null);
      setShowModal(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Add a new todo"
      />
      <button className="addButton"onClick={handleAddTodo}>Add</button>

      <ul className={todos.length > 2 ? 'scrollable' : ''}>
        {todos.map((todo, index) => (
          <li 
            key={index}
            className={todo.completed ? 'completed' : ''} // Apply 'completed' class if the todo is done
            onClick={() => toggleComplete(index)} // Toggle completion on click
          >
            <span>
              {todo.text}
            </span>
            <button className="to-doButton" onClick={(e) => {
              e.stopPropagation(); // Prevent toggling complete when clicking remove button
              confirmRemoveTodo(index);
            }}>
              X
            </button>
            <span>{todo.timestamp}</span>
          </li>
        ))}
      </ul>

      <Modal
        show={showModal}
        title="Confirm Remove"
        message="Sure you want to remove this task?"
        onConfirm={handleConfirmRemove}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default TodoList;
