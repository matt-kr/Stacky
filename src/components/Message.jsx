import { useState, useEffect, useRef, memo } from 'react';

const Message = memo(function Message({ message }) {
  // State for managing image loading transition
  const [imageUrl, setImageUrl] = useState(null);
  const [isS3Loaded, setIsS3Loaded] = useState(false);
  const imageRef = useRef(null);
  const cleanupRef = useRef(null);
  
  useEffect(() => {
    if (message.image || message.blobUrl || message.s3Url) {
      // Priority: Start with blob URL for instant display, then transition to S3
      if (message.blobUrl) {
        console.log('Using blob URL for immediate display:', message.blobUrl);
        setImageUrl(message.blobUrl);
        setIsS3Loaded(false);
        
        // If we have S3 URL, preload it in background
        if (message.s3Url) {
          console.log('Preloading S3 URL in background:', message.s3Url);
          const img = new Image();
          img.onload = () => {
            console.log('S3 image loaded, transitioning from blob to S3');
            
            // Smooth transition without layout shift
            if (imageRef.current) {
              const currentHeight = imageRef.current.offsetHeight;
              const currentWidth = imageRef.current.offsetWidth;
              
              // Temporarily fix dimensions to prevent jump
              imageRef.current.style.height = currentHeight + 'px';
              imageRef.current.style.width = currentWidth + 'px';
              
              // Change src
              setImageUrl(message.s3Url);
              setIsS3Loaded(true);
              
              // Remove fixed dimensions after transition
              setTimeout(() => {
                if (imageRef.current) {
                  imageRef.current.style.height = '';
                  imageRef.current.style.width = '';
                }
              }, 300);
            } else {
              setImageUrl(message.s3Url);
              setIsS3Loaded(true);
            }
            
            // Clean up blob URL after transition - store cleanup function
            cleanupRef.current = setTimeout(() => {
              if (message.blobUrl) {
                URL.revokeObjectURL(message.blobUrl);
                console.log('Cleaned up blob URL');
              }
            }, 1000); // Increased delay to prevent premature cleanup
          };
          img.onerror = () => {
            console.error('Failed to load S3 image, keeping blob URL');
          };
          img.src = message.s3Url;
        }
      } else if (message.s3Url) {
        // Direct S3 URL if no blob
        setImageUrl(message.s3Url);
        setIsS3Loaded(true);
      } else if (message.image) {
        // Fallback to original image prop
        setImageUrl(message.image);
        setIsS3Loaded(true);
      }
    }
    
    // Cleanup on unmount or message change
    return () => {
      if (cleanupRef.current) {
        clearTimeout(cleanupRef.current);
      }
      // Only cleanup blob if we're unmounting, not on re-render
      if (message.blobUrl && isS3Loaded) {
        URL.revokeObjectURL(message.blobUrl);
      }
    };
  }, [message.image, message.blobUrl, message.s3Url]); // Removed isS3Loaded from deps to prevent re-runs

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
          {imageUrl && (
            <div className="message-image" style={{ position: 'relative' }}>
              <img 
                ref={imageRef}
                src={imageUrl} 
                alt="Shared image" 
                style={{
                  maxWidth: '300px',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  display: 'block',
                  transition: 'opacity 0.3s ease-in-out',
                  opacity: imageUrl ? 1 : 0
                }} 
              />
              {/* Show loading indicator only if we're using blob and waiting for S3 */}
              {message.blobUrl && message.s3Url && !isS3Loaded && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>
                  📡 Uploading...
                </div>
              )}
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
});

export default Message;