import { debugBus } from '../DebugBus.js';

/**
 * Session Collector - Tracks session data and provides refresh functionality
 */

// API Configuration (matching App.jsx)
const API_BASE_URL = 'https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test/api';

let currentSessionId = null;
let sessionData = null;
let isLoading = false;
let refreshInterval = null;

export function installSessionCollector() {
  console.log('🔧 Installing Session Collector...');
  
  // Get initial session ID from localStorage
  checkSessionId();
  
  // Monitor localStorage changes for session ID
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    const result = originalSetItem.apply(this, arguments);
    if (key === 'returnSessionId') {
      checkSessionId();
    }
    return result;
  };
  
  debugBus.log('info', 'Session Collector installed');
  console.log('✅ Session Collector installed successfully');
}

function checkSessionId() {
  const newSessionId = localStorage.getItem('returnSessionId');
  if (newSessionId !== currentSessionId) {
    currentSessionId = newSessionId;
    
    if (currentSessionId) {
      // Start periodic refresh for active session
      startPeriodicRefresh();
      fetchSessionData(); // Initial fetch
    } else {
      // Stop refresh when no session
      stopPeriodicRefresh();
      sessionData = null;
      debugBus.logSessionData(null);
    }
  }
}

function startPeriodicRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  
  refreshInterval = setInterval(() => {
    if (currentSessionId) {
      fetchSessionData();
    }
  }, 8000); // Refresh every 8 seconds when session is active
}

function stopPeriodicRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

export async function fetchSessionData() {
  if (!currentSessionId || isLoading) return;
  
  isLoading = true;
  debugBus.log('info', `Fetching session data for: ${currentSessionId}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/customer-returns/sessions/${currentSessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const rawData = await response.text(); // Get as text first
      console.log('📋 Raw session data received:', rawData);
      
      // Try to parse as JSON, fallback to formatted text
      let parsedData;
      try {
        parsedData = JSON.parse(rawData);
      } catch (parseError) {
        // If it's not valid JSON, format the text nicely
        parsedData = {
          rawResponse: rawData,
          parseError: 'Response was not valid JSON',
          sessionId: currentSessionId,
          fetchedAt: new Date().toISOString()
        };
      }
      
      sessionData = parsedData;
      debugBus.logSessionData(sessionData);
      debugBus.log('info', 'Session data fetched successfully');
      
    } else {
      const errorText = await response.text();
      debugBus.logError(new Error(`Session fetch failed: ${response.status}`), `Failed to fetch session ${currentSessionId}`);
      sessionData = {
        error: `HTTP ${response.status}: ${response.statusText}`,
        errorDetails: errorText,
        sessionId: currentSessionId,
        fetchedAt: new Date().toISOString()
      };
      debugBus.logSessionData(sessionData);
    }
  } catch (error) {
    console.error('❌ Session fetch error:', error);
    debugBus.logError(error, `Session fetch error for ${currentSessionId}`);
    sessionData = {
      error: error.message,
      sessionId: currentSessionId,
      fetchedAt: new Date().toISOString()
    };
    debugBus.logSessionData(sessionData);
  } finally {
    isLoading = false;
  }
}

export function getCurrentSessionData() {
  return {
    sessionId: currentSessionId,
    data: sessionData,
    isLoading
  };
}

export function refreshSessionData() {
  if (currentSessionId) {
    fetchSessionData();
  } else {
    debugBus.log('warn', 'No session ID available to refresh');
  }
}

export function uninstallSessionCollector() {
  // Reset localStorage.setItem (this is a simplified approach)
  // In a real app, you'd want to store and restore the original
  debugBus.log('info', 'Session Collector uninstalled');
}
