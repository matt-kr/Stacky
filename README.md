# Stacky Chatbot 🤖

A comprehensive chatbot application featuring AI-powered conversations with image analysis capabilities. Built with React and powered by OpenAI's GPT-4o-mini model, this project showcases modern web development practices with cross-platform camera functionality and responsive design.

## ✨ Live Demo
https://stacky-six.vercel.app/

## 🏗️ Project Structure & Code Organization

This section provides a comprehensive guide to where different aspects of the codebase live:

### **Core Application Files**

#### `/src/App.jsx` - Main Application Component (650+ lines)
The heart of the application containing all primary functionality:

- **State Management** (Lines 25-50)
  - UI states: menus, greeting, loading states
  - Camera states: preview, stream, live view
  - Chat states: messages, errors, retry logic

- **Image Processing Utilities** (Lines 55-80)
  - `compressImage()` - Reduces image size for mobile compatibility
  - Device detection logic for platform-specific handling

- **Navigation & Menu Handlers** (Lines 85-150)
  - Hamburger menu toggle and animations
  - Photo menu controls
  - Menu action handlers (new chat, website, sound toggle)

- **Camera & Photo Functionality** (Lines 155-350)
  - Cross-platform photo handling (iOS/Android/Desktop)
  - Live camera capture for desktop
  - Photo preview and confirmation system
  - Device-specific optimization logic

- **Message Sending & API Communication** (Lines 355-550)
  - `handleSendMessage()` - Standard message handling
  - `handleSendMessageWithContext()` - Image message handling
  - Retry logic with exponential backoff
  - Comprehensive error handling and logging

- **React Lifecycle & Effects** (Lines 555-580)
  - Message persistence to localStorage
  - Click-outside menu closing
  - Cleanup functions for camera streams

#### `/src/App.css` - Complete Styling
Comprehensive CSS covering all visual aspects:
- Responsive design with mobile-first approach
- Camera interface styling
- Menu animations and transitions
- Focus outline removal for Android
- Dark theme variables and layouts

### **Component Files**

#### `/src/components/ChatInput.jsx`
Handles user text input and photo menu integration:
- Multi-line text input with auto-resize
- Enter/Shift+Enter key handling
- Photo button with camera SVG icon
- Platform-specific photo menu rendering

#### `/src/components/MessageList.jsx`
Displays chat conversation:
- Message rendering with sender differentiation
- Image message support
- Loading indicators
- Scroll management and auto-scroll to bottom

#### `/src/components/Message.jsx`
Individual message component:
- Text and image rendering
- Timestamp formatting
- Sender-specific styling
- Responsive message bubbles

### **Backend & API**

#### `/api/reply.js` - Vercel Serverless Function
Complete OpenAI API integration:

- **Request Validation** (Lines 10-25)
  - Method checking and input validation

- **Message Preparation** (Lines 30-45)
  - System prompt configuration
  - OpenAI message format setup

- **Conversation History Processing** (Lines 50-85)
  - Multi-turn conversation support
  - Image message handling in history
  - Role-based message formatting

- **OpenAI API Communication** (Lines 90-115)
  - GPT-4o-mini model configuration
  - Vision capabilities for image analysis
  - Response streaming setup (currently disabled)

- **Error Handling** (Lines 120-140)
  - Comprehensive error responses
  - Logging for debugging

### **Configuration Files**

#### `/vite.config.js`
- Development server configuration
- Build optimization settings
- Plugin configuration for React

#### `/package.json`
- Project dependencies and scripts
- Build and development commands
- Project metadata

#### `/eslint.config.js`
- Code quality and style enforcement
- React-specific linting rules

### **Static Assets**

#### `/public/`
- `Stacky.png` - Main logo/mascot image
- `vite.svg` - Framework logo
- `index.html` - Application entry point

### **Key Features by File Location**

| Feature | Primary File | Supporting Files |
|---------|-------------|------------------|
| **Chat Interface** | `App.jsx` (Lines 590-650) | `MessageList.jsx`, `ChatInput.jsx` |
| **Image Upload/Camera** | `App.jsx` (Lines 155-350) | `App.css` (camera styles) |
| **AI Communication** | `api/reply.js` | `App.jsx` (API calls) |
| **Cross-Platform Optimization** | `App.jsx` (device detection) | `App.css` (responsive design) |
| **State Management** | `App.jsx` (Lines 25-50) | `localStorage` integration |
| **Error Handling** | `App.jsx` (retry logic) | `api/reply.js` (server errors) |
| **Responsive Design** | `App.css` | All component files |
| **Animations** | `App.css` | `App.jsx` (animation triggers) |

### **Development Workflow Files**

- **Hot Reload**: Vite configuration in `vite.config.js`
- **Code Quality**: ESLint rules in `eslint.config.js`
- **Deployment**: Vercel configuration (automatic from main branch)

## 🚀 Features Implemented

### **Core Chat Functionality**
- Real-time AI conversations with GPT-4o-mini
- Persistent conversation history (localStorage)
- Message retry with exponential backoff
- Comprehensive error handling

### **Advanced Image Capabilities**
- Cross-platform camera access (iOS/Android/Desktop)
- Live camera preview (desktop)
- Image compression for mobile optimization
- AI image analysis and description
- Platform-specific photo handling

### **User Experience**
- Responsive mobile-first design
- Smooth animations and transitions
- Hamburger navigation menu
- Interactive greeting system
- Loading states and visual feedback

### **Technical Features**
- Device detection and optimization
- Memory management for large images
- JSON payload size monitoring
- Robust error recovery
- Clean code architecture with comprehensive comments

## 🛠️ Technologies Used

- **Frontend**: React 18 with Vite
- **Styling**: CSS3 with custom properties
- **AI**: OpenAI GPT-4o-mini (vision-enabled)
- **Backend**: Vercel Serverless Functions
- **Deployment**: Vercel
- **Development**: ESLint for code quality

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or later)
- npm or yarn package manager

### Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/matt-kr/stacky-chatbot.git
   cd stacky-chatbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This creates a `dist` folder with optimized static files ready for deployment.

## 🔧 Development Notes

### **File Modification Guidelines**
- **UI Changes**: Modify `App.jsx` and component files in `/src/components/`
- **Styling**: Update `App.css` for visual changes
- **API Logic**: Edit `/api/reply.js` for backend modifications
- **Build Configuration**: Adjust `vite.config.js` for build settings

### **Adding New Features**
- **New Chat Features**: Add to appropriate section in `App.jsx`
- **New Components**: Create in `/src/components/` and import in `App.jsx`
- **New API Endpoints**: Create new files in `/api/` directory
- **New Styles**: Add to `App.css` with proper section comments

## 📱 Cross-Platform Considerations

The application handles device-specific behavior in several ways:
- **iOS**: Direct native file picker integration
- **Android**: Custom photo menu with compression
- **Desktop**: Live camera preview with manual capture
- **All Platforms**: Responsive design with touch-friendly interfaces

## 🤖 AI Integration Details

The chatbot uses OpenAI's GPT-4o-mini model with:
- **Vision capabilities** for image analysis
- **Conversation memory** maintaining context across messages
- **Streaming support** (configurable in `/api/reply.js`)
- **Error resilience** with automatic retry mechanisms

## 🔌 Customer Returns API Integration - Real Production Backend

### **Integration Success Story**

This project successfully demonstrates a complete integration with a live production API - the Customer Returns API running on AWS Lambda. This integration showcases real-world API consumption patterns and the challenges of connecting frontend applications to external services.

### **API Details**
- **Production Endpoint**: `https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test/api`
- **Architecture**: AWS Lambda + DynamoDB + S3 (serverless)
- **Authentication**: Session-based with cryptographic session IDs
- **AI-Powered**: OpenAI integration for natural language processing

### **Integration Architecture**

#### **Frontend Configuration** (`vite.config.js`)
```javascript
export default defineConfig({
  server: {
    port: 8081,  // Critical: API only allows localhost:8081
    proxy: {
      '/api': {
        target: 'https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

#### **API Service Layer** (`App.jsx` lines 140-350)
- `createReturnSession()` - Initializes customer return workflow
- `sendReturnMessage()` - Handles conversational messaging  
- `uploadReturnPhoto()` - Manages S3 photo uploads
- `getSessionDetails()` - Retrieves session state and history

### **Key Pain Points & Solutions**

#### **1. CORS Policy Restrictions**
**Problem**: API only allows requests from `localhost:8081`
```
Access to fetch at 'https://x8jxgxag72...' from origin 'http://localhost:5174' 
has been blocked by CORS policy
```

**Solution**: Configured Vite proxy + changed dev server port
- Modified `vite.config.js` to run on port 8081
- Set up proxy to route `/api/*` requests to AWS endpoint
- Enabled `changeOrigin: true` for proper header handling

#### **2. Async State Management Race Conditions**
**Problem**: React state updates are asynchronous, causing session ID to be `null`
```javascript
setSessionId(sessionData.data.session_id);  // Async
sendMessage(sessionId, text);  // Still null!
```

**Solution**: Capture session ID directly from response
```javascript
let currentSessionId = sessionId;
if (!sessionId) {
  const sessionData = await createReturnSession(customerInfo);
  currentSessionId = sessionData.data.session_id;  // Immediate access
  setSessionId(currentSessionId);  // Update state for next time
}
await sendReturnMessage(currentSessionId, text);  // Use captured ID
```

#### **3. API Response Structure Misalignment**
**Problem**: Incorrectly accessing nested response data
```javascript
// Wrong - treating response as flat
setSessionId(sessionData.session_id);
text: apiResponse.bot_response

// Correct - following API documentation structure  
setSessionId(sessionData.data.session_id);
text: apiResponse.bot_response.message
```

**Solution**: Carefully followed API documentation schema
- Session creation: `response.data.session_id`
- Message responses: `response.bot_response.message`
- Added response validation: `sessionData && sessionData.success && sessionData.data`

#### **4. Session Persistence & Validation**
**Problem**: Invalid session IDs stored in localStorage
```javascript
localStorage.getItem('returnSessionId')  // Could be 'null' string or undefined
```

**Solution**: Robust session validation
```javascript
const saved = localStorage.getItem('returnSessionId');
return (saved && saved !== 'null' && saved !== 'undefined') ? saved : null;
```

### **Critical Integration Lessons**

#### **1. CORS Configuration is Critical**
- External APIs often have strict CORS policies
- Development proxy configuration must match production requirements
- Port numbers and origins matter for security-focused APIs

#### **2. Async State Requires Careful Handling**
- Don't rely on React state immediately after `setState()`
- Capture async response values directly when needed immediately
- Use local variables for immediate access, state for persistence

#### **3. API Documentation is Gospel**
- Follow response structure exactly as documented
- Add validation for expected response format
- Test both success and error response paths

#### **4. Session Management Complexity**
- External session systems require robust validation
- localStorage can contain stale/invalid data
- Always validate session existence before API calls

#### **5. Development vs Production Considerations**
- Mock vs real API behavior can differ significantly
- Network latency affects user experience
- Error handling becomes more complex with external dependencies

### **Working Integration Flow**

1. **Session Creation**
   ```
   POST /customer-returns/sessions
   → {success: true, data: {session_id: "crs_...", ...}}
   ```

2. **Message Exchange**
   ```
   POST /customer-returns/sessions/{sessionId}/messages
   → {success: true, bot_response: {message: "..."}, ...}
   ```

3. **State Management**
   ```
   localStorage ↔ React State ↔ API Session
   ```

### **Performance Impact**
- **API Latency**: ~300-800ms per request (AWS Lambda cold starts)
- **Session Persistence**: Reduces unnecessary session creation
- **Error Recovery**: Automatic retry with exponential backoff
- **Memory Management**: Efficient handling of chat history

### **Security Considerations**
- API uses cryptographically secure session IDs (`crs_[43-chars]`)
- No API keys exposed in frontend (server-side authentication)
- CORS policy prevents unauthorized domain access
- Session expiration handled gracefully

This integration demonstrates how to successfully connect a React frontend to a production-grade API with proper error handling, state management, and user experience considerations. The result is a robust, real-world application that handles the complexities of external service integration.



