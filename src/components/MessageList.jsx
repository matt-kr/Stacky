import { useEffect, useRef } from 'react';
import Message from './Message';

export default function MessageList({ messages, isLoading }) {
  console.log('MessageList component received props:', { messages, isLoading });

  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map(msg => <Message key={msg.id} message={msg} />)}
      {isLoading && <p className="typing-indicator">Stacky is typing...</p>}
      <div ref={endOfMessagesRef} />
    </div>
  );
}