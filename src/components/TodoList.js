import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Modal from './Modal';

const TodoList = ({ user }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [todoToRemove, setTodoToRemove] = useState(null);

  // Fetch todos from Firestore when the component mounts or the user changes
  useEffect(() => {
    if (user) {
      const fetchTodos = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'todos'));
          const todosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTodos(todosList);
        } catch (error) {
          console.error('Error fetching todos:', error);
        }
      };
      fetchTodos();
    }
  }, [user]);

  // Handle adding a new todo
  const handleAddTodo = async () => {
    console.log('Adding todo:', newTodo); // Debug log
    if (newTodo.trim() !== '') {
      try {
        const docRef = await addDoc(collection(db, 'todos'), { text: newTodo, completed: false });
        console.log('Todo added with ID:', docRef.id); // Debug log
        setTodos([...todos, { id: docRef.id, text: newTodo, completed: false }]);
        setNewTodo('');
      } catch (error) {
        console.error('Error adding todo:', error); // Debug log
      }
    } else {
      console.warn('Todo text is empty'); // Debug log
    }
  };

  // Toggle the completion status of a todo
  const toggleComplete = async (id) => {
    const todo = todos.find(todo => todo.id === id);
    try {
      await updateDoc(doc(db, 'todos', id), { completed: !todo.completed });
      setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    } catch (error) {
      console.error('Error updating todo:', error); // Debug log
    }
  };

  // Confirm removal of a todo
  const confirmRemoveTodo = (id) => {
    setTodoToRemove(id);
    setShowModal(true);
  };

  // Handle confirmed removal of a todo
  const handleConfirmRemove = async () => {
    try {
      await deleteDoc(doc(db, 'todos', todoToRemove));
      setTodos(todos.filter(todo => todo.id !== todoToRemove));
      setShowModal(false);
    } catch (error) {
      console.error('Error removing todo:', error); // Debug log
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setNewTodo(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={newTodo}
        onChange={handleInputChange}
        placeholder="Add a new todo"
      />
      <button onClick={handleAddTodo}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''} onClick={() => toggleComplete(todo.id)}>
            {todo.text}
            <button onClick={(e) => { e.stopPropagation(); confirmRemoveTodo(todo.id); }}>X</button>
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
