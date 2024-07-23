import React, { useState } from 'react';

const TodoList = ({ todos, addTodo, removeTodo, toggleComplete }) => {
  const [newTodo, setNewTodo] = useState('');

  // Add a new todo item if it's not empty and not a duplicate
  const handleAddTodo = () => {
    if (newTodo.trim() !== '' && !todos.some(todo => todo.text === newTodo.trim())) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  // Handle pressing Enter key to add a new todo item
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  // Handle the removal of a todo item after confirmation
  const handleRemoveTodo = (index) => {
    const confirmRemove = window.confirm("Are you sure you are done?");
    if (confirmRemove) {
      removeTodo(index);
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
      <button onClick={handleAddTodo}>Add</button>
      <ul className={todos.length > 4 ? 'scrollable' : ''}>
        {todos.map((todo, index) => (
          <li key={index} className={todo.completed ? 'completed' : ''}>
            <span onClick={() => toggleComplete(index)}>{todo.text}</span>
            <button onClick={() => handleRemoveTodo(index)}>done</button>
            <br />
            <small>{todo.timestamp}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
