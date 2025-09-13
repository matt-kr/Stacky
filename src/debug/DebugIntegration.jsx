// Debug integration for main app
// This file integrates the debug system into the main application

import React from 'react';
import HiddenActivator from './HiddenActivator.jsx';

export const DebugIntegration = () => {
  // Check if debug mode is available in this environment
  const isDebugAvailable = import.meta.env.VITE_DEBUG_OVERLAY === '1';
  
  // Check if user has already authenticated debug mode
  const isDebugAuthenticated = localStorage.getItem('stacky_debug') === '1';
  
  if (!isDebugAvailable) {
    return null; // No debug in production unless explicitly enabled
  }

  if (isDebugAuthenticated) {
    // Import and render debug components asynchronously
    const DebugComponents = React.lazy(() => import('./DebugComponents.jsx'));
    
    return (
      <React.Suspense fallback={null}>
        <DebugComponents />
      </React.Suspense>
    );
  }

  // Show hidden activator for authentication
  return <HiddenActivator />;
};

export default DebugIntegration;
