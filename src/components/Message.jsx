export default function Message({ message }) {
  // The 'message' prop will have { text, sender, timestamp }
  const isUser = message.sender === 'user';
  const bubbleClass = isUser ? 'user-bubble' : 'assistant-bubble';

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className={`message-bubble ${bubbleClass}`}>
        <p className="message-text">{message.text}</p>
        <span className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}