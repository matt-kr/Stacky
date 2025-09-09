import { useState, useEffect, useContext } from 'react'
import './App.css'
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';

const API_URL = '/api/reply';

const systemPrompt = "You are a helpful AI assistant.";

function App() {
 const [showGreeting, setShowGreeting] = useState(false);
 const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
 const [isHamburgerMenuClosing, setIsHamburgerMenuClosing] = useState(false);
 const [showPhotoMenu, setShowPhotoMenu] = useState(false);
 const [isPhotoMenuClosing, setIsPhotoMenuClosing] = useState(false);
 const [soundEnabled, setSoundEnabled] = useState(true);
 const [cameraPreview, setCameraPreview] = useState(null); // { imageUrl, file }
 const [showCameraView, setShowCameraView] = useState(false); // Live camera view
 const [cameraStream, setCameraStream] = useState(null); // Camera stream
 
 const handleLogoClick = () => {
   setShowGreeting(true);
   setTimeout(() => setShowGreeting(false), 2000);
 };

 const handleHamburgerClick = () => {
   if (showHamburgerMenu) {
     // Start closing animation
     setIsHamburgerMenuClosing(true);
     setTimeout(() => {
       setShowHamburgerMenu(false);
       setIsHamburgerMenuClosing(false);
     }, 200); // Match the slideUpOut animation duration
   } else {
     setShowHamburgerMenu(true);
   }
 };

 const closeHamburgerMenu = () => {
   if (showHamburgerMenu) {
     setIsHamburgerMenuClosing(true);
     setTimeout(() => {
       setShowHamburgerMenu(false);
       setIsHamburgerMenuClosing(false);
     }, 200);
   }
 };

 const handlePhotoClick = () => {
   if (showPhotoMenu) {
     // Start closing animation
     setIsPhotoMenuClosing(true);
     setTimeout(() => {
       setShowPhotoMenu(false);
       setIsPhotoMenuClosing(false);
     }, 200); // Match the slideUpOut animation duration
   } else {
     setShowPhotoMenu(true);
   }
 };

 const closePhotoMenu = () => {
   if (showPhotoMenu) {
     setIsPhotoMenuClosing(true);
     setTimeout(() => {
       setShowPhotoMenu(false);
       setIsPhotoMenuClosing(false);
     }, 200);
   }
 };

 const handlePhotoUpload = () => {
   // Create a hidden file input to trigger file selection
   const fileInput = document.createElement('input');
   fileInput.type = 'file';
   fileInput.accept = 'image/*';
   fileInput.onchange = (event) => {
     const file = event.target.files[0];
     if (file && file.type.startsWith('image/')) {
       const imageUrl = URL.createObjectURL(file);
       setCameraPreview({ imageUrl, file });
     }
   };
   fileInput.click();
   closePhotoMenu();
 };

 const handleCameraCapture = async () => {
   try {
     // Check if we're on mobile or desktop
     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
     
     // Camera constraints - use back camera on mobile, default on desktop
     const constraints = {
       video: {
         facingMode: isMobile ? 'environment' : 'user', // 'environment' = back camera, 'user' = front camera
         width: { ideal: 1920 },
         height: { ideal: 1080 }
       }
     };

     // Get camera stream
     const stream = await navigator.mediaDevices.getUserMedia(constraints);
     setCameraStream(stream);
     setShowCameraView(true);
     
   } catch (error) {
     console.error('Camera access failed:', error);
     alert('Camera access failed. Please check permissions and try again.');
   }
   closePhotoMenu();
 };

 const takePicture = () => {
   if (!cameraStream) return;
   
   // Create video element to capture frame
   const video = document.createElement('video');
   video.srcObject = cameraStream;
   video.play();
   
   // Wait for video to load then capture
   video.onloadedmetadata = () => {
     // Create canvas to capture frame
     const canvas = document.createElement('canvas');
     canvas.width = video.videoWidth;
     canvas.height = video.videoHeight;
     const ctx = canvas.getContext('2d');
     
     // Draw current frame to canvas
     ctx.drawImage(video, 0, 0);
     
     // Convert canvas to blob and show preview
     canvas.toBlob((blob) => {
       if (blob) {
         const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
         const imageUrl = URL.createObjectURL(blob);
         setCameraPreview({ imageUrl, file });
         closeCameraView();
       }
     }, 'image/jpeg', 0.9);
   };
 };

 const closeCameraView = () => {
   if (cameraStream) {
     cameraStream.getTracks().forEach(track => track.stop());
     setCameraStream(null);
   }
   setShowCameraView(false);
 };

 const handleConfirmPhoto = async () => {
   if (cameraPreview) {
     // Create a new message with the image
     const newMessage = {
       id: Date.now(),
       text: 'I\'ve shared an image with you.',
       sender: 'user',
       image: cameraPreview.imageUrl,
       timestamp: new Date()
     };
     
     const updatedMessages = [...messages, newMessage];
     setMessages(updatedMessages);
     
     // Clean up the preview
     setCameraPreview(null);
     
     // Send the message with image to the API
     setIsLoading(true);
     setError(null);
     
     try {
       // For now, we'll just send a text message about the image
       // In a real implementation, you'd upload the image to a server and send the URL
       const apiMessages = [
         ...updatedMessages.slice(0, -1).map(msg => ({ role: msg.sender, content: msg.text })),
         { role: 'user', content: 'I\'ve shared an image with you. [Image uploaded but not processed in this demo]' }
       ];
       
       const response = await sendMessage(apiMessages);
       const assistantMessage = {
         id: Date.now() + 1,
         text: response,
         sender: 'assistant',
         timestamp: new Date()
       };
       
       const finalMessages = [...updatedMessages, assistantMessage];
       setMessages(finalMessages);
       localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
       
     } catch (error) {
       console.error('Error sending message:', error);
       setError('Failed to send message. Please try again.');
     } finally {
       setIsLoading(false);
     }
   }
 };

 const handleRetakePhoto = () => {
   if (cameraPreview) {
     URL.revokeObjectURL(cameraPreview.imageUrl); // Clean up memory
     setCameraPreview(null);
   }
 };

 const handleNewChat = () => {
   setMessages([]);
   closeHamburgerMenu();
 };

 const handleGoToWebsite = () => {
   window.open('https://returnstack.ai/', '_blank');
   closeHamburgerMenu();
 };

 const toggleSound = () => {
   setSoundEnabled(!soundEnabled);
   closeHamburgerMenu();
 };
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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHamburgerMenu && !event.target.closest('.hamburger-menu-container')) {
        closeHamburgerMenu();
      }
      if (showPhotoMenu && !event.target.closest('.photo-menu-container')) {
        closePhotoMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showHamburgerMenu, showPhotoMenu]);


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
      <header className="chat-header" style={{position: 'sticky', top: 0, zIndex: 10, background: 'var(--container-bg)'}}>
        <div className="hamburger-menu-container" style={{position: 'relative'}}>
          <button className={`hamburger-button ${showHamburgerMenu ? 'open' : ''}`} onClick={handleHamburgerClick}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          {showHamburgerMenu && (
            <div className={`hamburger-menu ${isHamburgerMenuClosing ? 'closing' : ''}`}>
              <button onClick={handleNewChat}>New Chat</button>
              <button onClick={handleGoToWebsite}>Visit ReturnStack.ai</button>
              <hr />
              <button onClick={toggleSound}>
                {soundEnabled ? '🔇 Sound Off' : '🔊 Sound On'}
              </button>
            </div>
          )}
        </div>
        <h1>ReturnStacky</h1>
        <div style={{position: 'relative', display: 'inline-block'}}>
          <img src="/Stacky.png" alt="Stacky Logo" className="header-logo" style={{cursor: 'pointer'}} onClick={handleLogoClick} />
          {showGreeting && (
            <div className="greeting-bubble">Hi there!<br/>How can I help?</div>
          )}
        </div>
      </header>
       <MessageList messages={messages} isLoading={isLoading} />
       <ChatInput 
         onSendMessage={handleSendMessage} 
         isLoading={isLoading}
         showPhotoMenu={showPhotoMenu}
         isPhotoMenuClosing={isPhotoMenuClosing}
         onPhotoClick={handlePhotoClick}
         onPhotoUpload={handlePhotoUpload}
         onCameraCapture={handleCameraCapture}
       />
       {retryInfo && (
         <div className="retry-info">
           Retrying... (attempt {retryInfo.attempt}/{retryInfo.maxRetries})
           <button onClick={cancelRetry}>Cancel</button>
         </div>
       )}
       {error && <p className="error-message">{error}</p>}
       
       {/* Live Camera View */}
       {showCameraView && (
         <div className="camera-view-overlay">
           <div className="camera-view-container">
             <video 
               ref={(video) => {
                 if (video && cameraStream) {
                   video.srcObject = cameraStream;
                   video.play();
                 }
               }}
               className="camera-video"
               autoPlay
               playsInline
               muted
             />
             <div className="camera-controls">
               <button className="camera-close-btn" onClick={closeCameraView}>
                 ✕ Close
               </button>
               <button className="camera-capture-btn" onClick={takePicture}>
                 📸 Capture
               </button>
             </div>
           </div>
         </div>
       )}
       
       {/* Camera Preview Modal */}
       {cameraPreview && (
         <div className="camera-preview-overlay">
           <div className="camera-preview-modal">
             <div className="camera-preview-header">
               <h3>Photo Preview</h3>
             </div>
             <div className="camera-preview-image">
               <img src={cameraPreview.imageUrl} alt="Camera capture preview" />
             </div>
             <div className="camera-preview-actions">
               <button className="retake-btn" onClick={handleRetakePhoto}>
                 🔄 Retake
               </button>
               <button className="confirm-btn" onClick={handleConfirmPhoto}>
                 ✓ Use Photo
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

export default App