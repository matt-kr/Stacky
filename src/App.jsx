import { useState } from 'react'
import './App.css'
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';

const API_URL = 'https://vbwego9lp9.execute-api.us-east-1.amazonaws.com/prod';



function App() {
 const [messages, setMessages] = useState([]); // Array to hold all messages
 const [isLoading, setIsLoading] = useState(false); // For loading state
 const [error, setError] = useState(null); // For API errors

  const handleSendMessage = async (text) => {
     // 1. Add user message to the UI immediately
  const userMessage = {
    id: Date.now(),
    text,
    sender: 'user',
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, userMessage]);
  };

  return (
   <div className="chatbot-container">
      <h1>Hello, Stacky!</h1>
      {/* Pass the messages state down to the list */}
       <MessageList messages={messages} isLoading={isLoading} />
       {/* Identifies when loading is in progress */}
       <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
       {/* Display error message if exists */}
       {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default App
