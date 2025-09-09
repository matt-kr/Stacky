import { useState, useEffect, useContext } from 'react'
import './App.css'
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';

const API_URL = '/api/reply';

const systemPrompt = "You are a helpful AI assistant.";

function App() {
 const [messages, setMessages] = useState(() => { // Array to hold all messages
 const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
 const [isLoading, setIsLoading] = useState(false); // For loading state
 const [error, setError] = useState(null); // For API errors
 const [retryInfo, setRetryInfo] = useState(null); // { attempt, maxRetries, timeoutId }
  // useEffect hook to save messages on change 
  useEffect(() => {
    // This effect runs whenever the 'messages' array changes
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);


const handleSendMessage = async (text, retryCount = 0) => {
    const maxRetries = 3;
    const baseDelay = 1000;

    if (retryCount === 0) {
      const userMessage = {
        id: Date.now(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);
      setError(null);
    }

    // Build the history string from current messages
    const currentMessages = retryCount === 0 ? [...messages, { text, sender: 'user' }] : messages;
    const history = currentMessages.map(msg => {
      return `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`;
    }).join('\n');
    
    const promptToSend = `${systemPrompt}

---
${history}
Assistant:`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: promptToSend }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Failed to parse error JSON' }));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = {
      id: Date.now() + 1,
      text: data.reply,
      sender: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);
    setRetryInfo(null);

  } catch (err) {
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      const timeoutId = setTimeout(() => {
        handleSendMessage(text, retryCount + 1);
      }, delay);
      
      setRetryInfo({ attempt: retryCount + 1, maxRetries, timeoutId });
      return;
    }
    
    setError(err.message);
    setRetryInfo(null);
  } finally {
    if (retryCount >= maxRetries || retryCount === 0) {
      setIsLoading(false);
    }
  }
};

const cancelRetry = () => {
  if (retryInfo?.timeoutId) {
    clearTimeout(retryInfo.timeoutId);
    setRetryInfo(null);
    setIsLoading(false);
  }
};

  return (
   <div className="chatbot-container">
      <header className="chat-header">

        <h1>ReturnStacky</h1>
                <img src="/Stacky.png" alt="Stacky Logo" className="header-logo" />
      </header>
       <MessageList messages={messages} isLoading={isLoading} />
       <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
       {retryInfo && (
         <div className="retry-info">
           Retrying... (attempt {retryInfo.attempt}/{retryInfo.maxRetries})
           <button onClick={cancelRetry}>Cancel</button>
         </div>
       )}
       {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default App