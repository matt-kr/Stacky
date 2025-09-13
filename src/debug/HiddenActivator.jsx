import React, { useState } from 'react';

const HiddenActivator = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleActivatorClick = () => {
    setShowPrompt(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/debug/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Set local flag and reload
        localStorage.setItem('stacky_debug', '1');
        window.location.reload();
      } else {
        alert('Invalid password');
        setPassword('');
      }
    } catch (error) {
      console.error('Debug login error:', error);
      alert('Login failed');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const activatorStyle = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    width: '20px',
    height: '20px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    zIndex: 8888,
    opacity: 0 // Invisible but clickable
  };

  const promptStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '20px',
    zIndex: 9998,
    color: 'white',
    fontFamily: 'monospace'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9997
  };

  if (showPrompt) {
    return (
      <>
        <div style={overlayStyle} onClick={() => setShowPrompt(false)} />
        <div style={promptStyle}>
          <h3 style={{ margin: '0 0 15px 0' }}>🐛 Debug Access</h3>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter debug password"
              style={{
                width: '200px',
                padding: '8px',
                marginBottom: '10px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '4px',
                color: 'white',
                display: 'block'
              }}
              autoFocus
            />
            <div>
              <button
                type="submit"
                disabled={isLoading || !password}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  marginRight: '8px',
                  opacity: isLoading || !password ? 0.5 : 1
                }}
              >
                {isLoading ? 'Checking...' : 'Enable Debug'}
              </button>
              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  return <button style={activatorStyle} onClick={handleActivatorClick} />;
};

export default HiddenActivator;
