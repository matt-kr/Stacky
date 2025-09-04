import { useState, useEffect } from 'react'
import './App.css'
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';

const API_URL = '/api/reply';



function App() {
 const [messages, setMessages] = useState(() => { // Array to hold all messages
 const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
 const [isLoading, setIsLoading] = useState(false); // For loading state
 const [error, setError] = useState(null); // For API errors
  // useEffect hook to save messages on change 
  useEffect(() => {
    // This effect runs whenever the 'messages' array changes
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);


 const handleSendMessage = async (text) => {
console.log('1. handleSendMessage called with:', text);

  // 1. Add user message to the UI immediately
  const userMessage = {
    id: Date.now(),
    text,
    sender: 'user',
    timestamp: new Date(),
  };
  console.log('2. User message object created:', userMessage);
  
  setMessages(prev => [...prev, userMessage]);
  console.log('3. Updating messages state with user message.');

  // 2. Set loading state and clear previous errors
  setIsLoading(true);
  console.log('4. isLoading set to true.');
  setError(null);

  // 3. Make the API call
  try {
    console.log('5. Attempting to fetch from API_URL:', API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    console.log('6. Fetch response received:', response);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Failed to parse error JSON' }));
      console.error('6a. Response was NOT ok. Status:', response.status, 'Data:', errData);
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('7. Response JSON parsed:', data);
    const assistantMessage = {
      id: Date.now() + 1,
      text: data.reply,
      sender: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);
      console.log('8. Updated messages state with assistant message.');

  } catch (err) {
    console.error('9. An error occurred in the try block:', err);
    setError(err.message);
  } finally {
    
    // 4. Reset loading state
    setIsLoading(false);
    console.log('10. In finally block, isLoading set to false.');
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
