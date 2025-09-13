import { debugBus } from '../DebugBus.js';

/**
 * Error Collector - Captures console errors and unhandled rejections
 */

let originalConsoleError;
let originalConsoleWarn;

export function installErrorCollector() {
  // Capture console.error
  originalConsoleError = console.error;
  console.error = function(...args) {
    debugBus.logError(new Error(args.join(' ')), 'console.error');
    return originalConsoleError.apply(console, args);
  };
  
  // Capture console.warn
  originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    debugBus.log('warn', args.join(' '));
    return originalConsoleWarn.apply(console, args);
  };
  
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    debugBus.logError(event.reason, 'Unhandled Promise Rejection');
  });
  
  // Capture general errors
  window.addEventListener('error', (event) => {
    debugBus.logError(event.error || new Error(event.message), `${event.filename}:${event.lineno}`);
  });
  
  debugBus.log('info', 'Error Collector installed');
}

export function uninstallErrorCollector() {
  if (originalConsoleError) {
    console.error = originalConsoleError;
  }
  if (originalConsoleWarn) {
    console.warn = originalConsoleWarn;
  }
  
  debugBus.log('info', 'Error Collector uninstalled');
}
