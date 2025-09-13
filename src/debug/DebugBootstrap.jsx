// Debug system bootstrap and initialization
// This module handles the setup and initialization of the debug system

import { debugBus } from './DebugBus.js';

// Import collectors
import './collectors/apiCollector.js';
import './collectors/errorCollector.js';
import './collectors/photoCollector.js';

export const initializeDebugSystem = () => {
  // Check if debug is enabled
  const isDebugEnabled = import.meta.env.VITE_DEBUG_OVERLAY === '1';
  const isAuthenticated = localStorage.getItem('stacky_debug') === '1';
  
  if (!isDebugEnabled || !isAuthenticated) {
    return false;
  }

  try {
    // Initialize debug bus
    debugBus.log('🚀 Debug system starting...');
    
    // Add global debug utilities
    window.stackyDebug = {
      bus: debugBus,
      clearLogs: () => debugBus.clear(),
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
        debugBus.log(`🔔 Notifications ${enabled ? 'enabled' : 'disabled'}`);
      }
    };

    // Setup enhanced error reporting
    const originalConsoleError = console.error;
    console.error = (...args) => {
      debugBus.logError('console.error', { args });
      originalConsoleError.apply(console, args);
    };

    // Setup unhandled promise rejection tracking
    window.addEventListener('unhandledrejection', (event) => {
      debugBus.logError('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });

    debugBus.log('✅ Debug system initialized successfully');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize debug system:', error);
    return false;
  }
};

// Auto-initialize when imported
export const debugSystemEnabled = initializeDebugSystem();
