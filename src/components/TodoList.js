import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

const TodoList = ({ userId }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [todoToRemove, setTodoToRemove] = useState(null);
  const [error, setError] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const parseInput = (input) => {
    const words = input.split(' ');
    const link = words.find(word => isValidUrl(word)) || '';
    const text = words.filter(word => word !== link).join(' ');
    return { text, link };
  };

  useEffect(() => {
    if (userId) {
      const q = query(collection(db, 'todos'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const todosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          todosData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setTodos(todosData);
        },
        (error) => {
          console.error("Error fetching todos:", error);
          setError("Failed to fetch todos. Please check your connection and try again.");
        }
      );
      return () => unsubscribe();
    }
  }, [userId]);

  const handleAddTodo = async () => {
    if (newTodo.trim() !== '') {
      try {
        const timestamp = new Date().toISOString();
        const { text, link } = parseInput(newTodo);
        await addDoc(collection(db, 'todos'), {
          text,
          link,
          completed: false,
          timestamp,
          userId
        });
        setNewTodo('');
        setError(null);
      } catch (error) {
        console.error("Error adding todo:", error);
        setError("Failed to add todo. Please try again.");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const confirmRemoveTodo = (id) => {
    setTodoToRemove(id);
    setShowModal(true);
  };

  const handleConfirmRemove = async () => {
    if (todoToRemove) {
      try {
        const todoToMove = todos.find(todo => todo.id === todoToRemove);
        if (todoToMove) {
          // Remove from todos
          await deleteDoc(doc(db, 'todos', todoToRemove));
          
          // Add to history with server timestamp
          await addDoc(collection(db, 'history'), {
            text: todoToMove.text,
            link: todoToMove.link,
            removedAt: serverTimestamp(),
            userId
          });
        }
        setTodoToRemove(null);
        setShowModal(false);
        setError(null);
      } catch (error) {
        console.error("Error removing todo:", error);
        setError("Failed to remove todo. Please try again.");
      }
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      await updateDoc(doc(db, 'todos', id), { completed: !completed });
      setError(null);
    } catch (error) {
      console.error("Error updating todo:", error);
      setError("Failed to update todo. Please try again.");
    }
  };

  const handleEditTodo = async (id, newInput) => {
    if (newInput.trim() !== '') {
      try {
        const { text, link } = parseInput(newInput);
        await updateDoc(doc(db, 'todos', id), { 
          text,
          link
        });
        setEditingTodo(null);
        setEditText('');
        setError(null);
      } catch (error) {
        console.error("Error editing todo:", error);
        setError("Failed to edit todo. Please try again.");
      }
    }
  };

  const handleMenuAction = (action, todo) => {
    if (action === 'edit') {
      setEditingTodo(todo.id);
      setEditText(`${todo.text} ${todo.link}`);
    } else if (action === 'remove') {
      confirmRemoveTodo(todo.id);
    }
  };

  const toggleDropdown = (todoId, e) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === todoId ? null : todoId);
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Add a new todo"
      />
      <button className="addButton" onClick={handleAddTodo}>Add</button>

      <ul className={todos.length > 2 ? 'scrollable' : ''}>
        {todos.map((todo) => (
          <li 
            key={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
            onClick={() => toggleComplete(todo.id, todo.completed)}
          >
            {editingTodo === todo.id ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => handleEditTodo(todo.id, editText)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleEditTodo(todo.id, editText);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <>
                <span>{todo.text}</span>
                {todo.link && (
                  <a href={todo.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    Link
                  </a>
                )}
                <div className="dropdown">
                  <div 
                    className="hamburger-menu"
                    onClick={(e) => toggleDropdown(todo.id, e)}
                  >
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line"></div>
                  </div>
                  {openDropdown === todo.id && (
                    <div className="dropdown-content">
                      <button onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('edit', todo);
                        setOpenDropdown(null);
                      }}>Edit</button>
                      <button onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('remove', todo);
                        setOpenDropdown(null);
                      }}>Remove</button>
                    </div>
                  )}
                </div>
                <span className="timestamp">{formatDate(todo.timestamp)}</span>
              </>
            )}
          </li>
        ))}
      </ul>

      <Modal
        show={showModal}
        title="Confirm Remove"
        message="Are you sure you want to remove this task? It will be moved to the history."
        onConfirm={handleConfirmRemove}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default TodoList;
