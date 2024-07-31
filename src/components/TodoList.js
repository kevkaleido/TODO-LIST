import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

const TodoList = ({ userId }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [todoToRemove, setTodoToRemove] = useState(null);

  useEffect(() => {
    if (userId) {
      const q = query(collection(db, 'todos'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const todosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTodos(todosData);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const handleAddTodo = async () => {
    if (newTodo.trim() !== '' && !todos.some(todo => todo.text === newTodo.trim())) {
      const timestamp = new Date().toISOString();
      await addDoc(collection(db, 'todos'), {
        text: newTodo.trim(),
        completed: false,
        timestamp,
        userId
      });
      setNewTodo('');
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
      await deleteDoc(doc(db, 'todos', todoToRemove));
      setTodoToRemove(null);
      setShowModal(false);
    }
  };

  const toggleComplete = async (id, completed) => {
    await updateDoc(doc(db, 'todos', id), { completed: !completed });
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
        message="Sure you want to remove this task?"
        onConfirm={handleConfirmRemove}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default TodoList;