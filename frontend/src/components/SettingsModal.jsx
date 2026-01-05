import { useState, useEffect } from 'react';
import SettingsForm from './SettingsForm';
import { adminAPI } from '../services/api';

function SettingsModal({ onClose }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await adminAPI.getSettings();
      setSettings(result.settings);
    } catch (err) {
      setError('Failed to load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedSettings) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      await adminAPI.updateSettings(updatedSettings);

      setSuccess('Settings saved successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to save settings: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {loading && !settings ? (
            <div className="loading">Loading settings...</div>
          ) : settings ? (
            <SettingsForm
              settings={settings}
              onSave={handleSave}
              loading={loading}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
