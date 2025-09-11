export default function Message({ message }) {
  // The 'message' prop will have { text, sender, timestamp, image?, structured_questions?, next_steps? }
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
          {message.image && (
            <div className="message-image">
              <img src={message.image} alt="Shared image" style={{
                maxWidth: '300px',
                maxHeight: '300px',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                display: 'block'
              }} />
            </div>
          )}
          <p className="message-text">{message.text}</p>
          
          {/* Display structured questions if present */}
          {message.structured_questions && message.structured_questions.length > 0 && (
            <div className="structured-questions" style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Please provide:
              </p>
              <ul style={{ margin: '0', paddingLeft: '1rem', fontSize: '0.9rem' }}>
                {message.structured_questions.map((question, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Display next steps if present */}
          {message.next_steps && message.next_steps.length > 0 && (
            <div className="next-steps" style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 255, 0, 0.3)'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Next Steps:
              </p>
              <ol style={{ margin: '0', paddingLeft: '1rem', fontSize: '0.9rem' }}>
                {message.next_steps.map((step, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          
          <span className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}