import { useState } from 'react'
import './App.css'
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';

const API_URL = '/api/reply';



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

  // 2. Set loading state and clear previous errors
  setIsLoading(true);
  setError(null);

  // 3. Make the API call
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) {
      // Handle HTTP errors 
      const errData = await response.json();
      throw new Error(errData.error || 'Uh Oh, Stacky knocked over some boxes!');
    }

    const data = await response.json();
    const assistantMessage = {
      id: Date.now() + 1,
      text: data.reply,
      sender: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

  } catch (err) {
    setError(err.message);
  } finally {
    
    // 4. Reset loading state
    setIsLoading(false);
  }  
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
