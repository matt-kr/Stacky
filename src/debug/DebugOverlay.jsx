import React, { useState, useEffect, useRef } from 'react';
import { debugBus } from './DebugBus.js';

const DebugOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('session');
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [debugData, setDebugData] = useState(debugBus.getData());
  
  const overlayRef = useRef(null);
  const dragRef = useRef(null);

  // Subscribe to debug updates
  useEffect(() => {
    const unsubscribe = debugBus.addListener(setDebugData);
    return unsubscribe;
  }, []);

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e) => {
    if (!dragRef.current?.contains(e.target)) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#10b981'; // green
    if (status >= 300 && status < 400) return '#f59e0b'; // yellow
    if (status >= 400) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const overlayStyle = {
    position: 'fixed',
    top: position.y,
    left: position.x,
    width: isOpen ? '400px' : '60px',
    height: isOpen ? '500px' : '60px',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    color: 'white',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'hidden',
    transition: 'width 0.2s, height 0.2s',
    cursor: isDragging ? 'grabbing' : 'default'
  };

  const headerStyle = {
    padding: '8px 12px',
    backgroundColor: '#374151',
    borderBottom: '1px solid #4b5563',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'grab'
  };

  const tabStyle = {
    display: 'flex',
    backgroundColor: '#1f2937',
    borderBottom: '1px solid #4b5563'
  };

  const tabButtonStyle = (isActive) => ({
    flex: 1,
    padding: '8px 4px',
    backgroundColor: isActive ? '#374151' : 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '11px',
    cursor: 'pointer'
  });

  const contentStyle = {
    height: 'calc(100% - 80px)',
    overflow: 'auto',
    padding: '8px'
  };

  const logEntryStyle = {
    marginBottom: '4px',
    padding: '4px',
    backgroundColor: '#374151',
    borderRadius: '4px',
    fontSize: '10px'
  };

  if (!isOpen) {
    return (
      <div style={overlayStyle} ref={overlayRef} onMouseDown={handleMouseDown}>
        <div
          ref={dragRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            backgroundColor: '#10b981',
            borderRadius: '8px'
          }}
          onClick={() => setIsOpen(true)}
        >
          🐛
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'session':
        return (
          <div>
            <div style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => window.stackyDebug?.refreshSession?.()} 
                style={{ 
                  backgroundColor: '#10b981', 
                  border: 'none', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '3px', 
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🔄 Refresh
              </button>
            </div>
            {debugData.sessionData ? (
              <div style={logEntryStyle}>
                <div style={{ color: '#10b981', marginBottom: '8px' }}>
                  Session Data [{formatTime(debugData.sessionData.timestamp)}]
                </div>
                <pre style={{ 
                  color: '#e5e7eb', 
                  fontSize: '11px', 
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {JSON.stringify(debugData.sessionData.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                No session data available. Use the refresh button to fetch session information.
              </div>
            )}
          </div>
        );
      
      case 'logs':
        return (
          <div>
            {debugData.logs.slice(-50).map(log => (
              <div key={log.id} style={logEntryStyle}>
                <div style={{ color: log.level === 'error' ? '#ef4444' : '#10b981' }}>
                  [{formatTime(log.timestamp)}] {log.level.toUpperCase()}
                </div>
                <div>{log.message}</div>
                {log.data && <div style={{ color: '#9ca3af' }}>{JSON.stringify(log.data)}</div>}
              </div>
            ))}
          </div>
        );
      
      case 'api':
        return (
          <div>
            {debugData.apiCalls.slice(-20).map(call => (
              <div key={call.id} style={logEntryStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: getStatusColor(call.status) }}>
                    {call.method} {call.status}
                  </span>
                  <span>{call.duration}ms</span>
                </div>
                <div style={{ color: '#9ca3af', wordBreak: 'break-all' }}>
                  {call.url}
                </div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>
                  {formatTime(call.timestamp)}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'photos':
        return (
          <div>
            {debugData.photoEvents.slice(-30).map(event => (
              <div key={event.id} style={logEntryStyle}>
                <div style={{ color: '#f59e0b' }}>
                  📸 {event.event}
                </div>
                <div style={{ color: '#9ca3af' }}>
                  {JSON.stringify(event.details, null, 1)}
                </div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>
                  {formatTime(event.timestamp)}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'errors':
        return (
          <div>
            {debugData.errors.slice(-20).map(error => (
              <div key={error.id} style={{...logEntryStyle, backgroundColor: '#7f1d1d'}}>
                <div style={{ color: '#fca5a5' }}>
                  ❌ {error.type}: {error.message}
                </div>
                {error.context && (
                  <div style={{ color: '#9ca3af' }}>{error.context}</div>
                )}
                <div style={{ fontSize: '9px', color: '#6b7280' }}>
                  {formatTime(error.timestamp)}
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <div style={overlayStyle} ref={overlayRef} onMouseDown={handleMouseDown}>
      <div ref={dragRef} style={headerStyle}>
        <span>🐛 Debug</span>
        <div>
          <button 
            onClick={() => debugBus.clear()} 
            style={{ marginRight: '8px', backgroundColor: '#374151', border: 'none', color: 'white', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer' }}
          >
            Clear
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('stacky_debug');
              window.location.reload();
            }} 
            style={{ marginRight: '8px', backgroundColor: '#dc2626', border: 'none', color: 'white', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer' }}
            title="Exit debug mode"
          >
            Logout
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            style={{ backgroundColor: '#ef4444', border: 'none', color: 'white', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      </div>
      
      <div style={tabStyle}>
        <button 
          style={tabButtonStyle(activeTab === 'session')} 
          onClick={() => setActiveTab('session')}
        >
          Session
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'logs')} 
          onClick={() => setActiveTab('logs')}
        >
          Logs ({debugData.logs.length})
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'api')} 
          onClick={() => setActiveTab('api')}
        >
          API ({debugData.apiCalls.length})
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'photos')} 
          onClick={() => setActiveTab('photos')}
        >
          Photos ({debugData.photoEvents.length})
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'errors')} 
          onClick={() => setActiveTab('errors')}
        >
          Errors ({debugData.errors.length})
        </button>
      </div>
      
      <div style={contentStyle}>
        {renderContent()}
      </div>
    </div>
  );
};

export default DebugOverlay;
