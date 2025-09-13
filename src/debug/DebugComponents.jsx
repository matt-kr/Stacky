import React from 'react';
import DebugOverlay from './DebugOverlay.jsx';
import { initializeDebugSystem } from './DebugBootstrap.jsx';

// This component renders when debug mode is authenticated
const DebugComponents = () => {
  // Initialize debug system when component mounts
  React.useEffect(() => {
    // Initialize the debug system
    const isInitialized = initializeDebugSystem();
    
    if (isInitialized) {
      console.log('🐛 Stacky Debug Mode Active');
      console.log('📝 Run stackyDebugLogout() to disable debug mode');
    }
    
    // Add a logout function to console for easy access
    window.stackyDebugLogout = () => {
      localStorage.removeItem('stacky_debug');
      window.location.reload();
    };
    
    return () => {
      // Cleanup on unmount
      delete window.stackyDebugLogout;
    };
  }, []);

  return <DebugOverlay />;
};

export default DebugComponents;
