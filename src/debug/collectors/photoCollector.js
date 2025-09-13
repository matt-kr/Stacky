import { debugBus } from '../DebugBus.js';

/**
 * Photo Collector - Tracks photo workflow events
 */

// Track blob URL operations
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

export function installPhotoCollector() {
  // Track blob creation
  URL.createObjectURL = function(object) {
    const blobUrl = originalCreateObjectURL.call(this, object);
    
    debugBus.logPhotoEvent('blob_created', {
      blobUrl,
      objectType: object.constructor.name,
      size: object.size || 'unknown'
    });
    
    return blobUrl;
  };
  
  // Track blob cleanup
  URL.revokeObjectURL = function(blobUrl) {
    debugBus.logPhotoEvent('blob_revoked', { blobUrl });
    return originalRevokeObjectURL.call(this, blobUrl);
  };
  
  debugBus.log('info', 'Photo Collector installed');
}

export function uninstallPhotoCollector() {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
  debugBus.log('info', 'Photo Collector uninstalled');
}

// Helper functions for manual photo event logging
export function logPhotoUploadStart(file, sessionId) {
  debugBus.logPhotoEvent('upload_start', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    sessionId
  });
}

export function logPhotoUploadSuccess(photoUrl, sessionId) {
  debugBus.logPhotoEvent('upload_success', {
    photoUrl,
    sessionId
  });
}

export function logPhotoUploadError(error, sessionId) {
  debugBus.logPhotoEvent('upload_error', {
    error: error.message,
    sessionId
  });
}

export function logPhotoTransition(from, to) {
  debugBus.logPhotoEvent('image_transition', {
    from,
    to,
    transitionType: from.includes('blob:') ? 'blob_to_s3' : 'direct'
  });
}
