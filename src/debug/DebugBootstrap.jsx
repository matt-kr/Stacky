// Debug system bootstrap and initialization
// This module handles the setup and initialization of the debug system

import { debugBus } from './DebugBus.js';

// Import collectors
import { installApiCollector } from './collectors/apiCollector.js';
import { installErrorCollector } from './collectors/errorCollector.js';
import { installPhotoCollector } from './collectors/photoCollector.js';
import { installSessionCollector, refreshSessionData } from './collectors/sessionCollector.js';

export const initializeDebugSystem = () => {
  // Check if debug is enabled
  const isDebugEnabled = import.meta.env.VITE_DEBUG_OVERLAY === '1';
  const isAuthenticated = localStorage.getItem('stacky_debug') === '1';
  
  if (!isDebugEnabled || !isAuthenticated) {
    return false;
  }

  try {
    // Initialize debug bus
    debugBus.enable(); // Enable the debug bus first!
    debugBus.log('info', '🚀 Debug system starting...');
    
    // Install collectors
    installSessionCollector();
    installApiCollector();
    installErrorCollector();
    installPhotoCollector();
    
    // Add global debug utilities
    window.stackyDebug = {
      bus: debugBus,
      clearLogs: () => debugBus.clear(),
      refreshSession: refreshSessionData,
      test: () => {
        debugBus.log('info', 'Test message from console');
        debugBus.logApiCall('GET', '/test', 200, 150, { test: true });
        debugBus.logPhotoEvent('test_event', { test: true });
        debugBus.logError(new Error('Test error'), 'Manual test');
        console.log('Test messages added to debug bus');
      },
      getLogs: () => ({
        sessionData: debugBus.sessionData,
        logs: debugBus.logs,
        apiCalls: debugBus.apiCalls,
        photoEvents: debugBus.photoEvents,
        errors: debugBus.errors
      }),
      exportLogs: () => {
        const logs = debugBus.getLogs();
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stacky-debug-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      toggleNotifications: (enabled) => {
        debugBus.notificationsEnabled = enabled;
        debugBus.log('info', `🔔 Notifications ${enabled ? 'enabled' : 'disabled'}`);
      }
    };

    debugBus.log('info', '✅ Debug system initialized successfully');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize debug system:', error);
    return false;
  }
};

// Auto-initialize when imported
export const debugSystemEnabled = initializeDebugSystem();
