import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Sign-in successful
      window.dispatchEvent(new Event('signin-success'));
      navigate('/'); // Redirect to home page
    } catch (error) {
      setErrorMessage(error.message);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setErrorMessage('');
  };

  return (
    <>
      <form onSubmit={handleSignIn}>
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
        <button className="SignIn-button" type="submit">SignIn</button>
      </form>
      <Modal
        show={showModal}
        title="Sign In Error"
        message={errorMessage}
        onConfirm={closeModal}
        onClose={closeModal}
      />
    </>
  );
};

export default SignIn;
