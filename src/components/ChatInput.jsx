import { useState, useRef, useEffect} from 'react';


export default function ChatInput({ onSendMessage, isLoading }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (!isLoading && inputRef.current) {
    inputRef.current?.focus();
    }
  }, [isLoading]);

const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="chat-input"
        placeholder="Ask Stacky anything..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading} //disable input while loading
      />
      <button type="submit" className="send-button" disabled={isLoading}>
        {isLoading ? <div className="loading-spinner"></div> : null}
      </button>
    </form>
  );
}