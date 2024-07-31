import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

const TodoList = ({ userId }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [todoToRemove, setTodoToRemove] = useState(null);
  const [error, setError] = useState(null);

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
    if (newTodo.trim() !== '' && !todos.some(todo => todo.text === newTodo.trim())) {
      try {
        const timestamp = new Date().toISOString();
        await addDoc(collection(db, 'todos'), {
          text: newTodo.trim(),
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
          
          // Add to history
          await addDoc(collection(db, 'history'), {
            text: todoToMove.text,
            timestamp: new Date().toISOString(),
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
            className={todo.completed ? 'completed' : ''}
            onClick={() => toggleComplete(todo.id, todo.completed)}
          >
            <span>{todo.text}</span>
            <button className="to-doButton" onClick={(e) => {
              e.stopPropagation();
              confirmRemoveTodo(todo.id);
            }}>
              X
            </button>
            <span>{new Date(todo.timestamp).toLocaleString()}</span>
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