import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Modal from './Modal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Login successful, you can add additional logic here if needed
    } catch (error) {
      setErrorMessage("Wrong password or email");
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setErrorMessage('');
  };

  return (
    <>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <Modal
        show={showModal}
        title="Login Error"
        message={errorMessage}
        onConfirm={closeModal}
        onClose={closeModal}
      />
    </>
  );
};

export default Login;