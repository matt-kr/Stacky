/**
 * Debug Bus - Central logging and event system
 * Collects all debug data in memory with size limits
 */

class DebugBus {
  constructor() {
    this.logs = [];
    this.apiCalls = [];
    this.stateChanges = [];
    this.photoEvents = [];
    this.errors = [];
    this.sessionData = null; // Store current session data
    this.maxItems = 1000; // Prevent memory issues
    this.listeners = new Set();
    this.isEnabled = false;
  }

  enable() {
    this.isEnabled = true;
    this.log('debug', 'Debug overlay enabled');
  }

  disable() {
    this.isEnabled = false;
    this.clear();
  }

  // Add listener for real-time updates
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of updates
  notify() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getData());
      } catch (error) {
        console.error('Debug listener error:', error);
      }
    });
  }

  // Generic logging
  log(level, message, data = null) {
    if (!this.isEnabled) return;

    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.redactSensitiveData(data)
    };

    this.logs.push(entry);
    this.trimArray(this.logs);
    this.notify();
  }

  // API call tracking
  logApiCall(method, url, status, duration, metadata = {}) {
    if (!this.isEnabled) return;

    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      method,
      url: this.redactUrl(url),
      status,
      duration,
      metadata: this.redactSensitiveData(metadata)
    };

    this.apiCalls.push(entry);
    this.trimArray(this.apiCalls);
    this.notify();
  }

  // State change tracking
  logStateChange(component, property, oldValue, newValue) {
    if (!this.isEnabled) return;

    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      component,
      property,
      oldValue: this.redactSensitiveData(oldValue),
      newValue: this.redactSensitiveData(newValue)
    };

    this.stateChanges.push(entry);
    this.trimArray(this.stateChanges);
    this.notify();
  }

  // Photo workflow tracking
  logPhotoEvent(event, details = {}) {
    if (!this.isEnabled) return;

    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      event,
      details: this.redactSensitiveData(details)
    };

    this.photoEvents.push(entry);
    this.trimArray(this.photoEvents);
    this.notify();
  }

  // Session data tracking
  logSessionData(data) {
    if (!this.isEnabled) return;

    this.sessionData = {
      timestamp: new Date().toISOString(),
      data: this.redactSensitiveData(data)
    };
    this.notify();
  }

  // Error tracking
  logError(error, context = '') {
    if (!this.isEnabled) return;

    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack,
      context,
      type: error.name || 'Error'
    };

    this.errors.push(entry);
    this.trimArray(this.errors);
    this.notify();
  }

  // Redact sensitive data
  redactSensitiveData(data) {
    if (!data) return data;
    
    const sensitiveKeys = [
      'password', 'token', 'auth', 'key', 'secret', 'credentials',
      'email', 'phone', 'ssn', 'credit', 'card'
    ];

    if (typeof data === 'string') {
      return sensitiveKeys.some(key => data.toLowerCase().includes(key)) 
        ? '[REDACTED]' 
        : data;
    }

    if (typeof data === 'object' && data !== null) {
      const redacted = Array.isArray(data) ? [] : {};
      
      for (const [key, value] of Object.entries(data)) {
        const keyLower = key.toLowerCase();
        const shouldRedact = sensitiveKeys.some(sensitive => keyLower.includes(sensitive));
        
        if (shouldRedact) {
          redacted[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          redacted[key] = this.redactSensitiveData(value);
        } else {
          redacted[key] = value;
        }
      }
      
      return redacted;
    }

    return data;
  }

  // Redact URLs (remove query params with sensitive data)
  redactUrl(url) {
    try {
      const urlObj = new URL(url);
      const sensitiveParams = ['token', 'auth', 'key', 'password'];
      
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });
      
      return urlObj.toString();
    } catch {
      return url; // Return as-is if not a valid URL
    }
  }

  // Prevent memory issues
  trimArray(arr) {
    if (arr.length > this.maxItems) {
      arr.splice(0, arr.length - this.maxItems);
    }
  }

  // Get all debug data
  getData() {
    return {
      sessionData: this.sessionData,
      logs: [...this.logs],
      apiCalls: [...this.apiCalls],
      stateChanges: [...this.stateChanges],
      photoEvents: [...this.photoEvents],
      errors: [...this.errors],
      summary: {
        totalLogs: this.logs.length,
        totalApiCalls: this.apiCalls.length,
        totalStateChanges: this.stateChanges.length,
        totalPhotoEvents: this.photoEvents.length,
        totalErrors: this.errors.length,
        lastActivity: this.logs[this.logs.length - 1]?.timestamp || null
      }
    };
  }

  // Clear all data
  clear() {
    this.logs.length = 0;
    this.apiCalls.length = 0;
    this.stateChanges.length = 0;
    this.photoEvents.length = 0;
    this.errors.length = 0;
    this.notify();
  }

  // Export data for debugging
  export() {
    return JSON.stringify(this.getData(), null, 2);
  }
}

// Create singleton instance
export const debugBus = new DebugBus();

// Global access for manual debugging
if (typeof window !== 'undefined') {
  window.debugBus = debugBus;
}
