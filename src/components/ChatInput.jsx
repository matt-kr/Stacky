import { useState, useRef, useEffect} from 'react';


export default function ChatInput({ 
  onSendMessage, 
  isLoading, 
  showPhotoMenu, 
  isPhotoMenuClosing, 
  onPhotoClick, 
  onPhotoUpload, 
  onCameraCapture 
}) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  
  // Check if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Shift+Enter will naturally create a new line
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className="photo-menu-container" style={{position: 'relative'}}>
        <button 
          type="button"
          className="photo-button" 
          onClick={onPhotoClick}
          disabled={isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2C8.45 2 8 2.45 8 3V4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16V3C16 2.45 15.55 2 15 2H9ZM12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7ZM12 9C10.35 9 9 10.35 9 12C9 13.65 10.35 15 12 15C13.65 15 15 13.65 15 12C15 10.35 13.65 9 12 9Z" fill="currentColor"/>
          </svg>
        </button>
        {showPhotoMenu && (
          <div className={`photo-menu ${isPhotoMenuClosing ? 'closing' : ''}`}>
            <button type="button" onClick={onCameraCapture}>
              📷 Camera
            </button>
            <button type="button" onClick={onPhotoUpload}>
              {isMobile ? '🖼️ Gallery' : '↑ Upload'}
            </button>
          </div>
        )}
      </div>
      <textarea
        ref={inputRef}
        className="chat-input"
        placeholder="Ask Stacky anything..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        rows={1}
        style={{ resize: 'none', overflow: 'hidden' }}
      />
      <button type="submit" className="send-button" disabled={isLoading}>
        {isLoading ? <div className="loading-spinner"></div> : null}
      </button>
    </form>
  );
}