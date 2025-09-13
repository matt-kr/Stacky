// Debug system bootstrap and initialization
// This module handles the setup and initialization of the debug system

import { debugBus } from './DebugBus.js';

// Import collectors
import { installApiCollector } from './collectors/apiCollector.js';
import { installErrorCollector } from './collectors/errorCollector.js';
import { installPhotoCollector } from './collectors/photoCollector.js';

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
    
    // Install collectors
    installApiCollector();
    installErrorCollector();
    installPhotoCollector();
    
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

    debugBus.log('✅ Debug system initialized successfully');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize debug system:', error);
    return false;
  }
};

// Auto-initialize when imported
export const debugSystemEnabled = initializeDebugSystem();
