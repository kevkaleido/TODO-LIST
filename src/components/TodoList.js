import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';
import { toast } from 'react-toastify';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './TodoList.css'; // Add this line to import the new CSS file

const TodoList = ({ userId }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [todoToRemove, setTodoToRemove] = useState(null);
  const [error, setError] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

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

  const checkDeadlines = (todos) => {
    const now = new Date();
    todos.forEach(todo => {
      if (todo.deadline) {
        const deadline = new Date(todo.deadline);
        const timeDiff = deadline.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
        if (daysDiff <= 1 && daysDiff > 0) {
          toast.warn(`Todo "${todo.text}" is due tomorrow!`);
        } else if (daysDiff === 0) {
          toast.error(`Todo "${todo.text}" is due today!`);
        }
      }
    });
  };

  useEffect(() => {
    if (userId) {
      const q = query(collection(db, 'todos'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const todosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          todosData.sort((a, b) => {
            if (a.priority && !b.priority) return -1;
            if (!a.priority && b.priority) return 1;
            if (a.deadline && b.deadline) {
              return new Date(a.deadline) - new Date(b.deadline);
            }
            if (a.deadline) return -1;
            if (b.deadline) return 1;
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
          setTodos(todosData);
          checkDeadlines(todosData);
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
          userId,
          priority: false,
          deadline: null
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
    } else if (action === 'togglePriority') {
      handleTogglePriority(todo.id, !todo.priority);
    } else if (action === 'setDeadline') {
      handleSetDeadline(todo.id);
    } else if (action === 'removeDeadline') {
      handleRemoveDeadline(todo.id);
    } else if (action === 'copy') {
      // The actual copying is handled in the render, this is just for closing the dropdown
      setOpenDropdown(null);
    }
  };

  const handleRemoveDeadline = async (id) => {
    try {
      await updateDoc(doc(db, 'todos', id), { deadline: null });
      setError(null);
    } catch (error) {
      console.error("Error removing todo deadline:", error);
      setError("Failed to remove todo deadline. Please try again.");
    }
  };

  const handleTogglePriority = async (id, priority) => {
    try {
      await updateDoc(doc(db, 'todos', id), { priority });
      setError(null);
    } catch (error) {
      console.error("Error updating todo priority:", error);
      setError("Failed to update todo priority. Please try again.");
    }
  };

  const handleSetDeadline = async (id) => {
    const todo = todos.find(t => t.id === id);
    const currentDateTime = todo.deadline || new Date().toISOString().slice(0, 16);
    const deadlineInput = document.createElement('input');
    deadlineInput.type = 'datetime-local';
    deadlineInput.value = currentDateTime;
    
    const wrapper = document.createElement('div');
    wrapper.appendChild(deadlineInput);
    wrapper.style.padding = '20px';
    wrapper.style.backgroundColor = 'white';
    wrapper.style.borderRadius = '5px';
    wrapper.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';

    const setDeadline = () => {
      const selectedDeadline = deadlineInput.value;
      if (selectedDeadline) {
        updateDoc(doc(db, 'todos', id), { deadline: selectedDeadline })
          .then(() => {
            setError(null);
            document.body.removeChild(wrapper);
          })
          .catch((error) => {
            console.error("Error setting todo deadline:", error);
            setError("Failed to set todo deadline. Please try again.");
          });
      }
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.marginRight = '10px';
    cancelButton.onclick = () => document.body.removeChild(wrapper);

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Set Deadline';
    confirmButton.onclick = setDeadline;

    const buttonWrapper = document.createElement('div');
    buttonWrapper.style.marginTop = '10px';
    buttonWrapper.appendChild(cancelButton);
    buttonWrapper.appendChild(confirmButton);
    wrapper.appendChild(buttonWrapper);

    document.body.appendChild(wrapper);
    wrapper.style.position = 'fixed';
    wrapper.style.top = '50%';
    wrapper.style.left = '50%';
    wrapper.style.transform = 'translate(-50%, -50%)';
    wrapper.style.zIndex = '1000';
  };

  const toggleDropdown = (todoId, e) => {
    e.stopPropagation();
    if (openDropdown === todoId) {
      setIsDropdownVisible(false);
      setTimeout(() => setOpenDropdown(null), 300); // Wait for animation to finish
    } else {
      setOpenDropdown(todoId);
      setIsDropdownVisible(true);
    }
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.dropdown')) {
        setOpenDropdown(null);
      }
    };
    const preventScrollClose = (e) => {
      e.stopPropagation();
    };
    document.addEventListener('click', closeDropdown);
    const dropdownContent = document.querySelector('.dropdown-content');
    if (dropdownContent) {
      dropdownContent.addEventListener('touchmove', preventScrollClose);
    }
    return () => {
      document.removeEventListener('click', closeDropdown);
      if (dropdownContent) {
        dropdownContent.removeEventListener('touchmove', preventScrollClose);
      }
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
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
              <textarea
                className="edit-todo-textarea"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => handleEditTodo(todo.id, editText)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
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
                    <div className={`dropdown-content ${isDropdownVisible ? 'visible' : ''}`}>
                      <span onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('edit', todo);
                        setOpenDropdown(null);
                      }} title="Edit">✏️</span>
                      <span onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('remove', todo);
                        setOpenDropdown(null);
                      }} title="Remove">🗑️</span>
                      <span onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('togglePriority', todo);
                        setOpenDropdown(null);
                      }} title={todo.priority ? 'Unprioritize' : 'Prioritize'}>
                        {todo.priority ? '⭐' : '☆'}
                      </span>
                      <span onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('setDeadline', todo);
                        setOpenDropdown(null);
                      }} title={todo.deadline ? 'Change Deadline' : 'Set Deadline'}>
                        {todo.deadline ? '🕒' : '⏰'}
                      </span>
                      {todo.deadline && (
                        <span onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMenuAction('removeDeadline', todo);
                          setOpenDropdown(null);
                        }} title="Remove Deadline">❌</span>
                      )}
                      <CopyToClipboard 
                        text={todo.text}
                        onCopy={() => {
                          toast.success('Todo text copied to clipboard!');
                          handleMenuAction('copy', todo);
                        }}
                      >
                        <span onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }} title="Copy">📋</span>
                      </CopyToClipboard>
                    </div>
                  )}
                </div>
                <span className="timestamp">{formatDate(todo.timestamp)}</span>
                {todo.priority && <span className="priority-indicator">⭐</span>}
                {todo.deadline && <span className="deadline-indicator">🕒</span>}
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
