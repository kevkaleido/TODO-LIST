import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

const ChatComponent = ({ userId, chatContext }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    let q;
    if (chatContext && chatContext.id) {
      q = query(
        collection(db, 'messages'),
        where('contextId', '==', chatContext.id),
        orderBy('timestamp', 'asc')
      );
    } else {
      q = query(
        collection(db, 'messages'),
        where('contextId', '==', null),
        orderBy('timestamp', 'asc')
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [chatContext]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        userId: userId,
        timestamp: new Date(),
        contextId: chatContext ? chatContext.id : null,
        contextType: chatContext ? chatContext.type : null,
        contextText: chatContext ? chatContext.text : null
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  return (
    <div className="chat-component">
      {chatContext && (
        <div className="chat-context">
          <h3>Chat Context:</h3>
          <p>{chatContext.text}</p>
          <p>Type: {chatContext.type}</p>
          {chatContext.completed !== undefined && (
            <p>Status: {chatContext.completed ? 'Completed' : 'Pending'}</p>
          )}
        </div>
      )}
      <div className="message-list">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.userId === userId ? 'sent' : 'received'}`}>
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatComponent;
