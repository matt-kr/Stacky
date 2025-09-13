# Stacky Debug System

A comprehensive debugging overlay system for the Stacky chatbot with password-protected access and real-time monitoring capabilities.

## Features

- 🔐 **Password Protected**: Secure access via environment variables
- 📊 **Real-time Monitoring**: Live tracking of API calls, errors, and photo uploads
- 🎯 **Targeted Logging**: Separate collectors for different event types
- 💾 **Data Export**: Export debug logs as JSON files
- 🎮 **Interactive UI**: Movable overlay panel with tabbed interface
- 🔒 **Data Security**: Automatic PII redaction and memory management

## Components

### Core System
- **DebugBus.js**: Central logging system with memory management
- **DebugOverlay.jsx**: Main UI component with movable panel
- **DebugIntegration.jsx**: Main app integration point

### Authentication
- **HiddenActivator.jsx**: Invisible activation button (top-right corner)
- **DebugComponents.jsx**: Authenticated debug components
- **api/debug/login.js**: Vercel API endpoint for password verification

### Collectors
- **ApiCollector.js**: Tracks all fetch requests and responses
- **ErrorCollector.js**: Captures console errors and promise rejections
- **PhotoCollector.js**: Monitors photo upload workflow

## Setup

### 1. Environment Variables
Set these in your Vercel dashboard:

```bash
VITE_DEBUG_OVERLAY=1                    # Enable debug overlay
DEBUG_PASSWORD=your_secure_password     # Set debug password
```

### 2. Access Debug Mode
1. Visit your deployed app
2. Click the invisible area in the top-right corner (20x20px)
3. Enter the debug password
4. Debug overlay will appear and persist

### 3. Disable Debug Mode
```javascript
// In browser console
stackyDebugLogout()
```

## Usage

### Debug Panel
- **Logs Tab**: General application logs and events
- **API Tab**: HTTP requests/responses with timing
- **Photos Tab**: Photo upload workflow tracking
- **Errors Tab**: JavaScript errors and exceptions

### Global Functions
```javascript
// Available in console when debug is active
stackyDebug.bus          // Access debug bus
stackyDebug.clearLogs()  // Clear all logs
stackyDebug.exportLogs() // Download logs as JSON
stackyDebugLogout()      // Disable debug mode
```

### Programmatic Logging
```javascript
import { debugBus } from './debug/DebugBus.js';

// Log general events
debugBus.log('User clicked button', { buttonId: 'submit' });

// Log API events
debugBus.logApi('POST /api/returns', { 
  request: requestData, 
  response: responseData,
  duration: 150 
});

// Log photo events
debugBus.logPhoto('upload_started', { 
  file: file.name, 
  size: file.size 
});

// Log errors
debugBus.logError('validation_failed', { 
  field: 'email', 
  value: 'invalid@' 
});
```

## Security Features

### Data Protection
- Automatic PII redaction (emails, phones, etc.)
- Memory limits to prevent excessive storage
- Environment-gated access
- No debug code in production unless explicitly enabled

### Access Control
- Password-protected activation
- Session-based authentication via localStorage
- Invisible UI activation to prevent accidental access
- Server-side password verification

## Development

### Adding New Collectors
```javascript
// Create new collector file
import { debugBus } from '../DebugBus.js';

// Install monitoring
debugBus.log('Installing MyCollector');

// Hook into events
window.addEventListener('myEvent', (event) => {
  debugBus.log('my_event', { data: event.detail });
});
```

### Extending the UI
The overlay is built with React and can be extended with new tabs or features by modifying `DebugOverlay.jsx`.

## Troubleshooting

### Debug Not Appearing
1. Check environment variables are set
2. Verify Vercel deployment includes API routes
3. Check browser console for errors
4. Ensure clicking in top-right corner (invisible button)

### Authentication Issues
1. Verify DEBUG_PASSWORD matches in Vercel dashboard
2. Check API endpoint is deployed (`/api/debug/login`)
3. Check browser network tab for 401/500 responses

### Performance Impact
- Debug system only loads when authenticated
- Collectors have minimal overhead
- Memory limits prevent excessive data storage
- Can be completely disabled via environment variables
