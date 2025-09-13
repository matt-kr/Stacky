import { debugBus } from '../DebugBus.js';

/**
 * API Collector - Wraps fetch to track all API calls
 */

// Store original fetch
const originalFetch = window.fetch;

export function installApiCollector() {
  console.log('🔧 Installing API Collector...');
  
  // Replace global fetch with our wrapper
  window.fetch = async function(...args) {
    console.log('🌐 Intercepted fetch call:', args[0]);
    const startTime = performance.now();
    const [url, options = {}] = args;
    const method = options.method || 'GET';
    
    // Log request start
    debugBus.log('info', `API Request: ${method} ${url}`);
    
    try {
      const response = await originalFetch.apply(this, args);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log(`✅ API call completed: ${method} ${url} - ${response.status} (${duration}ms)`);
      
      // Log successful response
      debugBus.logApiCall(method, url, response.status, duration, {
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Special handling for Customer Returns API
      if (url.includes('customer-returns')) {
        debugBus.log('info', `Customer Returns API: ${response.status} ${response.statusText}`, {
          url,
          method,
          duration,
          status: response.status
        });
      }
      
      // Special handling for photo uploads
      if (url.includes('/photos')) {
        debugBus.logPhotoEvent('api_request', {
          method,
          url,
          status: response.status,
          duration,
          success: response.ok
        });
      }
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      // Log failed request
      debugBus.logApiCall(method, url, 0, duration, {
        error: error.message,
        failed: true
      });
      
      debugBus.logError(error, `API Request Failed: ${method} ${url}`);
      
      throw error;
    }
  };
  
  debugBus.log('info', 'API Collector installed');
  console.log('✅ API Collector installed successfully');
}

export function uninstallApiCollector() {
  window.fetch = originalFetch;
  debugBus.log('info', 'API Collector uninstalled');
}
