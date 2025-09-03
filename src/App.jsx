import { useState } from 'react'
import './App.css'
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';

function App() {
  const [count, setCount] = useState(0)

  return (
   <div className="chatbot-container">
      <h1>Hello, Stacky!</h1>
      <MessageList />
      <ChatInput />
    </div>
  );
}

export default App
