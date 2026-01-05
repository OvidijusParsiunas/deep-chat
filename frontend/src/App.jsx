import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import LoginForm from './components/LoginForm';
import { authAPI, adminAPI } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [setupMode, setSetupMode] = useState(false);

  useEffect(() => {
    // Check authentication
    if (authAPI.isAuthenticated()) {
      setIsAuthenticated(true);
      setCurrentUser(authAPI.getCurrentUser());

      // Check provider status
      checkProviderStatus();
    }
  }, []);

  const checkProviderStatus = async () => {
    try {
      const status = await adminAPI.getProviderStatus();
      setSetupMode(status.setup_mode);

      // Auto-open settings if in setup mode
      if (status.setup_mode) {
        setShowSettings(true);
      }
    } catch (error) {
      console.error('Failed to check provider status:', error);
    }
  };

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    checkProviderStatus();
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>🤖 DGA Qiyas Copilot</h1>
          {setupMode && (
            <span className="setup-badge">Setup Mode</span>
          )}
        </div>
        <div className="header-right">
          <span className="user-info">
            👤 {currentUser?.display_name || currentUser?.username}
          </span>
          {currentUser?.is_admin && (
            <button
              className="btn-settings"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              ⚙️ Settings
            </button>
          )}
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {setupMode && !showSettings && (
          <div className="setup-banner">
            <p>
              ⚠️ No providers configured. Please configure at least one LLM provider in Settings.
            </p>
            {currentUser?.is_admin && (
              <button onClick={() => setShowSettings(true)} className="btn-primary">
                Open Settings
              </button>
            )}
          </div>
        )}

        <ChatInterface />
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => {
            setShowSettings(false);
            checkProviderStatus();
          }}
        />
      )}
    </div>
  );
}

export default App;
