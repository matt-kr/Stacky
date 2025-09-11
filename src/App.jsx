import { useState, useEffect } from 'react'
import './App.css'
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

// Customer Returns API Configuration
const API_BASE_URL = 'https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test/api';
const ENDPOINTS = {
  createSession: '/customer-returns/sessions',
  sendMessage: (sessionId) => `/customer-returns/sessions/${sessionId}/messages`,
  uploadPhoto: (sessionId) => `/customer-returns/sessions/${sessionId}/photos`,
  getSession: (sessionId) => `/customer-returns/sessions/${sessionId}`,
  getStatus: (sessionId) => `/customer-returns/sessions/${sessionId}/status`,
  complete: (sessionId) => `/customer-returns/sessions/${sessionId}/complete`
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {

  // ==========================================================================
  // STATE MANAGEMENT - UI & NAVIGATION
  // ==========================================================================
  
  const [showGreeting, setShowGreeting] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [isHamburgerMenuClosing, setIsHamburgerMenuClosing] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [isPhotoMenuClosing, setIsPhotoMenuClosing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ==========================================================================
  // STATE MANAGEMENT - CAMERA & PHOTO FUNCTIONALITY
  // ==========================================================================
  
  const [cameraPreview, setCameraPreview] = useState(null); // { imageUrl, file }
  const [showCameraView, setShowCameraView] = useState(false); // Live camera view
  const [cameraStream, setCameraStream] = useState(null); // Camera stream

  // ==========================================================================
  // STATE MANAGEMENT - CHAT FUNCTIONALITY
  // ==========================================================================
  
  // Session Management for Customer Returns API
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('returnSessionId') || null;
  });
  const [currentStep, setCurrentStep] = useState('session_setup');
  const [customerInfo, setCustomerInfo] = useState(() => {
    const saved = localStorage.getItem('customerInfo');
    return saved ? JSON.parse(saved) : { name: '', email: '', phone: '', order_id: '' };
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('inactive'); // inactive, active, completed
  
  // Chat messages adapted for Customer Returns workflow
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      // Filter out messages with blob URLs to prevent errors
      return parsed.filter(msg => !msg.image || !msg.image.startsWith('blob:'));
    }
    return [];
  });
  
  const [isLoading, setIsLoading] = useState(false); // For loading state
  const [error, setError] = useState(null); // For API errors
  const [retryInfo, setRetryInfo] = useState(null); // { attempt, maxRetries, timeoutId }

  // ==========================================================================
  // UTILITY FUNCTIONS - IMAGE PROCESSING
  // ==========================================================================
  
  // Image compression function to reduce payload size for mobile devices
  const compressImage = (dataUrl, quality = 0.7, maxWidth = 1024) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = dataUrl;
    });
  };

  // ==========================================================================
  // API SERVICE LAYER - CUSTOMER RETURNS INTEGRATION
  // ==========================================================================
  
  // Create new customer return session
  const createReturnSession = async (customerData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.createSession}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: customerData.order_id,
          merchant_id: 'greenvine', // Default merchant
          customer_info: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone
          },
          initial_message: 'I want to return my order'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create return session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating return session:', error);
      throw error;
    }
  };

  // Send message to customer return session
  const sendReturnMessage = async (sessionId, message) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.sendMessage(sessionId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Upload photo to customer return session
  const uploadReturnPhoto = async (sessionId, file, description = '') => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.uploadPhoto(sessionId)}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload photo');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  // Get session details and status
  const getSessionDetails = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.getSession(sessionId)}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get session details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting session details:', error);
      throw error;
    }
  };

  // ==========================================================================
  // UI INTERACTION HANDLERS - NAVIGATION & MENUS
  // ==========================================================================
  
  // Handle logo click to show greeting
  const handleLogoClick = () => {
    setShowGreeting(true);
    setTimeout(() => setShowGreeting(false), 2000);
  };

  // Handle hamburger menu toggle with animation
  const handleHamburgerClick = () => {
    if (showHamburgerMenu) {
      setIsHamburgerMenuClosing(true);
      setTimeout(() => {
        setShowHamburgerMenu(false);
        setIsHamburgerMenuClosing(false);
      }, 200);
    } else {
      setShowHamburgerMenu(true);
    }
  };

  // Close hamburger menu with animation
  const closeHamburgerMenu = () => {
    if (showHamburgerMenu) {
      setIsHamburgerMenuClosing(true);
      setTimeout(() => {
        setShowHamburgerMenu(false);
        setIsHamburgerMenuClosing(false);
      }, 200);
    }
  };

  // Close photo menu with animation
  const closePhotoMenu = () => {
    if (showPhotoMenu) {
      setIsPhotoMenuClosing(true);
      setTimeout(() => {
        setShowPhotoMenu(false);
        setIsPhotoMenuClosing(false);
      }, 200);
    }
  };

  // ==========================================================================
  // HAMBURGER MENU ACTION HANDLERS
  // ==========================================================================
  
  // Start a new return session
  const handleNewChat = () => {
    // Clear current session data
    setSessionId(null);
    setMessages([]);
    setCurrentStep('session_setup');
    setSessionStatus('inactive');
    setCurrentQuestion(null);
    setCustomerInfo({ name: '', email: '', phone: '', order_id: '' });
    
    // Clear localStorage
    localStorage.removeItem('returnSessionId');
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('customerInfo');
    
    closeHamburgerMenu();
  };

  // Open ReturnStack website in new tab
  const handleGoToWebsite = () => {
    window.open('https://returnstack.ai/', '_blank');
    closeHamburgerMenu();
  };

  // Toggle sound notifications
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    closeHamburgerMenu();
  };

  // ==========================================================================
  // PHOTO & CAMERA FUNCTIONALITY - MAIN HANDLERS
  // ==========================================================================
  
  // Handle photo button click - device-specific behavior
  const handlePhotoClick = () => {
    // Detect device type for platform-specific handling
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isIOS) {
      // iOS: Use native file picker directly (works perfectly with iOS)
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      
      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              // Compress image to avoid memory issues
              const compressedImageUrl = await compressImage(reader.result, 0.7, 1024);
              sendImageMessage(compressedImageUrl);
            } catch (error) {
              console.warn('Image compression failed, using original:', error);
              sendImageMessage(reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      fileInput.click();
      return;
    }

    // Android or Desktop: Show photo menu with options
    if (showPhotoMenu) {
      setIsPhotoMenuClosing(true);
      setTimeout(() => {
        setShowPhotoMenu(false);
        setIsPhotoMenuClosing(false);
      }, 200);
    } else {
      setShowPhotoMenu(true);
    }
  };

  // Handle camera capture option from photo menu
  const handleCameraCapture = async () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMobile = isAndroid || isIOS;
    
    if (isMobile) {
      // Mobile: Use native camera via file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.capture = 'environment'; // Force camera
      
      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
          await sendImageMessage(file);
        }
      };
      fileInput.click();
      closePhotoMenu();
      return;
    }

    // Desktop: Use custom camera implementation with live preview
    try {
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setShowCameraView(true);
      
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Camera access failed. Please check permissions and try again.');
    }
    closePhotoMenu();
  };

  // Handle photo upload option from photo menu
  const handlePhotoUpload = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Mobile: Send directly
          await sendImageMessage(file);
        } else {
          // Desktop: Show preview first
          const reader = new FileReader();
          reader.onload = () => {
            setCameraPreview({ imageUrl: reader.result, file });
          };
          reader.readAsDataURL(file);
        }
      }
    };
    fileInput.click();
    closePhotoMenu();
  };

  // ==========================================================================
  // CAMERA FUNCTIONALITY - DESKTOP LIVE CAPTURE
  // ==========================================================================
  
  // Capture photo from live camera stream
  const takePicture = () => {
    if (!cameraStream) return;
    
    const video = document.createElement('video');
    video.srcObject = cameraStream;
    video.play();
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Capture current frame
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob and create preview
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          const reader = new FileReader();
          reader.onload = () => {
            setCameraPreview({ imageUrl: reader.result, file });
            closeCameraView();
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', 0.9);
    };
  };

  // Close live camera view and stop stream
  const closeCameraView = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraView(false);
  };

  // ==========================================================================
  // PHOTO PREVIEW HANDLERS
  // ==========================================================================
  
  // Confirm and send the captured/selected photo
  const handleConfirmPhoto = async () => {
    if (cameraPreview) {
      let finalImageUrl = cameraPreview.imageUrl;
      
      // Compress for Android to avoid JSON parsing issues
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (isAndroid) {
        try {
          finalImageUrl = await compressImage(cameraPreview.imageUrl, 0.7, 1024);
        } catch (error) {
          console.warn('Image compression failed, using original:', error);
        }
      }
      
      // Create and send image message
      const newMessage = {
        id: Date.now(),
        text: '',
        sender: 'user',
        image: finalImageUrl,
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
      
      setCameraPreview(null);
      
      // Auto-trigger AI response
      setTimeout(() => {
        handleSendMessageWithContext('I\'ve shared an image with you.', updatedMessages);
      }, 100);
    }
  };

  // Retake photo - restart camera or file selection
  const handleRetakePhoto = async () => {
    if (cameraPreview) {
      setCameraPreview(null);
      
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isMobile = isAndroid || isIOS;
      
      if (isMobile) {
        // Mobile: Use native camera
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        if (isAndroid) {
          fileInput.capture = 'camera';
        }
        
        fileInput.onchange = (event) => {
          const file = event.target.files[0];
          if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
              setCameraPreview({ imageUrl: reader.result, file });
            };
            reader.readAsDataURL(file);
          }
        };
        fileInput.click();
        return;
      }
      
      // Desktop: Restart live camera
      try {
        const constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setCameraStream(stream);
        setShowCameraView(true);
        
      } catch (error) {
        console.error('Camera access failed:', error);
        alert('Camera access failed. Please check permissions and try again.');
      }
    }
  };

  // ==========================================================================
  // MESSAGE SENDING FUNCTIONALITY
  // ==========================================================================
  
  // Send image message with device-specific handling
  const sendImageMessage = async (fileOrDataUrl) => {
    if (typeof fileOrDataUrl === 'string') {
      // Already a data URL (from iOS or camera capture)
      const newMessage = {
        id: Date.now(),
        text: '',
        sender: 'user',
        image: fileOrDataUrl,
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
      
      // Auto-trigger AI response
      setTimeout(() => {
        handleSendMessageWithContext('I\'ve shared an image with you.', updatedMessages);
      }, 100);
    } else {
      // File object - convert to data URL with compression
      const reader = new FileReader();
      reader.onload = async () => {
        let finalImageUrl = reader.result;
        
        // Compress for Android to avoid JSON parsing issues
        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid) {
          try {
            finalImageUrl = await compressImage(reader.result, 0.7, 1024);
          } catch (error) {
            console.warn('Image compression failed, using original:', error);
          }
        }
        
        const newMessage = {
          id: Date.now(),
          text: '',
          sender: 'user',
          image: finalImageUrl,
          timestamp: new Date()
        };
        
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        
        // Auto-trigger AI response
        setTimeout(() => {
          handleSendMessageWithContext('I\'ve shared an image with you.', updatedMessages);
        }, 100);
      };
      reader.readAsDataURL(fileOrDataUrl);
    }
  };

  // ==========================================================================
  // API COMMUNICATION - MAIN MESSAGE HANDLERS
  // ==========================================================================
  
  // Send message with explicit context (used for image auto-responses)
  const handleSendMessageWithContext = async (text, contextMessages = null, retryCount = 0) => {
    const maxRetries = 3;
    const baseDelay = 1000;
    const messagesToUse = contextMessages || messages;

    // Add user message on first attempt
    if (retryCount === 0) {
      const userMessage = {
        id: Date.now(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };
      
      const updatedMessages = [...messagesToUse, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);
      setError(null);
    }

    try {
      // Initialize session if needed
      if (!sessionId) {
        setSessionStatus('initializing');
        const sessionData = await createReturnSession(customerId);
        if (sessionData) {
          setSessionId(sessionData.session_id);
          setCurrentStep(sessionData.current_step);
          setCustomerInfo(sessionData.customer_info || {});
          setSessionStatus('active');
          
          // Save session to localStorage
          localStorage.setItem('returnSessionId', sessionData.session_id);
          localStorage.setItem('currentStep', sessionData.current_step);
          localStorage.setItem('customerInfo', JSON.stringify(sessionData.customer_info || {}));
        } else {
          setSessionStatus('error');
          throw new Error('Failed to create return session');
        }
      }

      // Handle image uploads to S3 if present
      const currentMessages = retryCount === 0 ? [...messagesToUse, { text, sender: 'user' }] : messagesToUse;
      const lastUserMessage = [...currentMessages].reverse().find(msg => msg.sender === 'user');
      let imageUrl = null;
      
      if (lastUserMessage && lastUserMessage.image) {
        try {
          const uploadResult = await uploadReturnPhoto(sessionId, lastUserMessage.image);
          if (uploadResult && uploadResult.photo_url) {
            imageUrl = uploadResult.photo_url;
            console.log('Image uploaded to S3:', imageUrl);
          }
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          // Continue without image if upload fails
        }
      }

      // Send message to Customer Returns API
      const apiResponse = await sendReturnMessage(sessionId, text, imageUrl);
      
      if (!apiResponse) {
        throw new Error('No response received from Customer Returns API');
      }

      // Update session state from response
      if (apiResponse.current_step) {
        setCurrentStep(apiResponse.current_step);
        localStorage.setItem('currentStep', apiResponse.current_step);
      }
      
      if (apiResponse.customer_info) {
        setCustomerInfo(apiResponse.customer_info);
        localStorage.setItem('customerInfo', JSON.stringify(apiResponse.customer_info));
      }

      // Customer Returns API returns both messages in one response
      const updatedMessages = [...(retryCount === 0 ? messages : messages.slice(0, -1))];
      
      // Add user message (if not already added)
      if (retryCount === 0) {
        updatedMessages.push({
          id: Date.now(),
          text,
          sender: 'user',
          timestamp: new Date(),
          image: lastUserMessage?.image || null
        });
      }

      // Add bot response
      if (apiResponse.bot_response) {
        updatedMessages.push({
          id: Date.now() + 1,
          text: apiResponse.bot_response,
          sender: 'assistant',
          timestamp: new Date(),
          structured_questions: apiResponse.structured_questions || null,
          next_steps: apiResponse.next_steps || null
        });
      }

      setMessages(updatedMessages);
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
      setRetryInfo(null);

    } catch (err) {
      console.error('Customer Returns API Error:', err);
      
      // Handle retries with exponential backoff
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        const timeoutId = setTimeout(() => {
          handleSendMessageWithContext(text, contextMessages, retryCount + 1);
        }, delay);
        
        setRetryInfo({ attempt: retryCount + 1, maxRetries, timeoutId });
        return;
      }
      
      setError(`Customer Returns API: ${err.message}`);
      setRetryInfo(null);
    } finally {
      if (retryCount >= maxRetries || retryCount === 0) {
        setIsLoading(false);
      }
    }
  };

  // Standard message handler (used by ChatInput component)
  const handleSendMessage = async (text, retryCount = 0) => {
    const maxRetries = 3;
    const baseDelay = 1000;

    // Add user message on first attempt
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

    try {
      // Initialize session if needed
      if (!sessionId) {
        setSessionStatus('initializing');
        const sessionData = await createReturnSession(customerId);
        if (sessionData) {
          setSessionId(sessionData.session_id);
          setCurrentStep(sessionData.current_step);
          setCustomerInfo(sessionData.customer_info || {});
          setSessionStatus('active');
          
          // Save session to localStorage
          localStorage.setItem('returnSessionId', sessionData.session_id);
          localStorage.setItem('currentStep', sessionData.current_step);
          localStorage.setItem('customerInfo', JSON.stringify(sessionData.customer_info || {}));
        } else {
          setSessionStatus('error');
          throw new Error('Failed to create return session');
        }
      }

      // Handle image uploads to S3 if present
      const currentMessages = retryCount === 0 ? [...messages, { text, sender: 'user' }] : messages;
      const lastUserMessage = [...currentMessages].reverse().find(msg => msg.sender === 'user');
      let imageUrl = null;
      
      if (lastUserMessage && lastUserMessage.image) {
        try {
          const uploadResult = await uploadReturnPhoto(sessionId, lastUserMessage.image);
          if (uploadResult && uploadResult.photo_url) {
            imageUrl = uploadResult.photo_url;
            console.log('Image uploaded to S3:', imageUrl);
          }
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          // Continue without image if upload fails
        }
      }

      // Send message to Customer Returns API
      const apiResponse = await sendReturnMessage(sessionId, text, imageUrl);
      
      if (!apiResponse) {
        throw new Error('No response received from Customer Returns API');
      }

      // Update session state from response
      if (apiResponse.current_step) {
        setCurrentStep(apiResponse.current_step);
        localStorage.setItem('currentStep', apiResponse.current_step);
      }
      
      if (apiResponse.customer_info) {
        setCustomerInfo(apiResponse.customer_info);
        localStorage.setItem('customerInfo', JSON.stringify(apiResponse.customer_info));
      }

      // Customer Returns API returns both messages in one response
      const finalMessages = [...(retryCount === 0 ? messages : messages.slice(0, -1))];
      
      // Add user message (if not already added)
      if (retryCount === 0) {
        finalMessages.push({
          id: Date.now(),
          text,
          sender: 'user',
          timestamp: new Date(),
          image: lastUserMessage?.image || null
        });
      }

      // Add bot response
      if (apiResponse.bot_response) {
        finalMessages.push({
          id: Date.now() + 1,
          text: apiResponse.bot_response,
          sender: 'assistant',
          timestamp: new Date(),
          structured_questions: apiResponse.structured_questions || null,
          next_steps: apiResponse.next_steps || null
        });
      }

      setMessages(finalMessages);
      localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
      setRetryInfo(null);

    } catch (err) {
      console.error('Customer Returns API Error:', err);
      
      // Handle retries
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        const timeoutId = setTimeout(() => {
          handleSendMessage(text, retryCount + 1);
        }, delay);
        
        setRetryInfo({ attempt: retryCount + 1, maxRetries, timeoutId });
        return;
      }
      
      setError(`Customer Returns API: ${err.message}`);
      setRetryInfo(null);
    } finally {
      if (retryCount >= maxRetries || retryCount === 0) {
        setIsLoading(false);
      }
    }
  };

  // Cancel ongoing retry
  const cancelRetry = () => {
    if (retryInfo?.timeoutId) {
      clearTimeout(retryInfo.timeoutId);
      setRetryInfo(null);
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // SIDE EFFECTS & LIFECYCLE
  // ==========================================================================
  
  // Persist session data to localStorage
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('returnSessionId', sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
  }, [customerInfo]);
  
  // Persist messages to localStorage when messages change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Load existing session on component mount
  useEffect(() => {
    const loadExistingSession = async () => {
      const savedSessionId = localStorage.getItem('returnSessionId');
      if (savedSessionId) {
        try {
          const sessionData = await getSessionDetails(savedSessionId);
          if (sessionData.success && sessionData.data.status === 'active') {
            setSessionId(savedSessionId);
            setCurrentStep(sessionData.data.current_step);
            setSessionStatus('active');
            setCurrentQuestion(sessionData.data.current_question || null);
            
            // Load messages from session
            const sessionMessages = sessionData.data.messages.map(msg => ({
              id: msg.id,
              text: msg.message,
              sender: msg.type === 'customer' ? 'user' : 'assistant',
              timestamp: new Date(msg.timestamp),
              image: msg.metadata?.photo?.url || null
            }));
            setMessages(sessionMessages);
          } else {
            // Session expired or completed, clear it
            handleNewChat();
          }
        } catch (error) {
          console.error('Error loading existing session:', error);
          // Clear invalid session
          handleNewChat();
        }
      }
    };

    loadExistingSession();
  }, []); // Only run on mount

  // Handle clicks outside menus to close them
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

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="chatbot-container">
      {/* Header with navigation */}
      <header className="chat-header" style={{position: 'sticky', top: 0, zIndex: 10, background: 'var(--container-bg)'}}>
        {/* Hamburger Menu */}
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
              {/* <hr />
              <button onClick={toggleSound}>
                {soundEnabled ? '🔇 Sound Off' : '🔊 Sound On'}
              </button> */}
            </div>
          )}
        </div>
        
        {/* App Title */}
        <h1>ReturnStacky</h1>
        
        {/* Logo with Greeting */}
        <div style={{position: 'relative', display: 'inline-block'}}>
          <img src="/Stacky.png" alt="Stacky Logo" className="header-logo" style={{cursor: 'pointer'}} onClick={handleLogoClick} />
          {showGreeting && (
            <div className="greeting-bubble">Hi there!<br/>How can I help?</div>
          )}
        </div>
      </header>

      {/* Main Chat Interface */}
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

      {/* Retry Information */}
      {retryInfo && (
        <div className="retry-info">
          Retrying... (attempt {retryInfo.attempt}/{retryInfo.maxRetries})
          <button onClick={cancelRetry}>Cancel</button>
        </div>
      )}

      {/* Error Display */}
      {error && <p className="error-message">{error}</p>}

      {/* Session Status Display */}
      {sessionStatus === 'initializing' && (
        <div className="session-status" style={{
          padding: '0.75rem',
          margin: '0.5rem',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          border: '1px solid rgba(0, 123, 255, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          🔄 Initializing return session...
        </div>
      )}
      
      {sessionId && currentStep && (
        <div className="session-info" style={{
          padding: '0.5rem',
          margin: '0.5rem',
          backgroundColor: 'rgba(0, 255, 0, 0.05)',
          border: '1px solid rgba(0, 255, 0, 0.2)',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center'
        }}>
          Session active - Step: {currentStep}
        </div>
      )}
      
      {/* Live Camera View Modal */}
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
      
      {/* Photo Preview Modal */}
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