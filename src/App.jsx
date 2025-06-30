
import React, { useState } from 'react';
import { BusterGuard } from './bots/busterGuard';

export default function App() {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const buster = new BusterGuard();

  const handleSend = () => {
    const warning = buster.scanMessage(message);
    const newChat = [...chat, { user: 'You', text: message }];
    if (warning) {
      newChat.push({ user: 'Guard', text: warning.message });
    }
    setChat(newChat);
    setMessage('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Community Hub Chat</h1>
      <div style={{ minHeight: 200, border: '1px solid #ccc', padding: 10 }}>
        {chat.map((entry, i) => (
          <div key={i}><strong>{entry.user}:</strong> {entry.text}</div>
        ))}
      </div>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Say something..."
        style={{ width: '80%', marginTop: 10 }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
