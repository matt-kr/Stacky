export default function Message({ message }) {
  // The 'message' prop will have { text, sender, timestamp }
  const isUser = message.sender === 'user';
  const senderName = isUser ? 'You' : (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.1em'}}>
      <img src="/Stacky.png" alt="Stacky Logo" style={{height: '1.2em', width: 'auto', marginRight: '0.3em'}} />
      Stacky
    </span>
  );

  const rowClass = isUser ? 'user-row' : 'assistant-row';
  const bubbleClass = isUser ? 'user-bubble' : 'assistant-bubble';

  return (
    <div className={`message-row ${rowClass}`}>
      <div className="message-content">
        <p className="sender-name">{senderName}</p>
        <div className={`message-bubble ${bubbleClass}`}>
          <p className="message-text">{message.text}</p>
          <span className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}