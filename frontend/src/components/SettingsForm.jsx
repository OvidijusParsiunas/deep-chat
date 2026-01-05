import { useState } from 'react';
import { adminAPI } from '../services/api';

function SettingsForm({ settings, onSave, loading }) {
  const [activeTab, setActiveTab] = useState('llm');
  const [formData, setFormData] = useState(settings);
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});

  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    const newData = { ...formData };

    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setFormData(newData);
  };

  const handleTestConnection = async (serviceType, provider) => {
    const testKey = `${serviceType}-${provider}`;
    setTesting({ ...testing, [testKey]: true });
    setTestResults({ ...testResults, [testKey]: null });

    try {
      const config = formData[serviceType][provider];
      const result = await adminAPI.testConnection(serviceType, provider, config);

      setTestResults({ ...testResults, [testKey]: result });
    } catch (err) {
      setTestResults({
        ...testResults,
        [testKey]: {
          status: 'error',
          message: err.response?.data?.detail || err.message,
        },
      });
    } finally {
      setTesting({ ...testing, [testKey]: false });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderTestResult = (serviceType, provider) => {
    const testKey = `${serviceType}-${provider}`;
    const result = testResults[testKey];

    if (!result) return null;

    return (
      <div className={`test-result ${result.status}`}>
        <strong>{result.status === 'success' ? '✅' : '❌'}</strong>
        <span>{result.message}</span>
      </div>
    );
  };

  const renderLLMSettings = () => (
    <div className="settings-section">
      <h3>LLM Provider Configuration</h3>

      <div className="form-group">
        <label>Active Provider</label>
        <select
          value={formData.llm.active_provider || 'null'}
          onChange={(e) =>
            handleInputChange(
              'llm.active_provider',
              e.target.value === 'null' ? null : e.target.value
            )
          }
        >
          <option value="null">Not Configured</option>
          <option value="azure">Azure OpenAI</option>
          <option value="google">Google Vertex AI</option>
        </select>
      </div>

      {/* Azure OpenAI Settings */}
      <div className="provider-section">
        <h4>Azure OpenAI</h4>

        <div className="form-group">
          <label>API Key</label>
          <input
            type="password"
            value={formData.llm.azure.api_key}
            onChange={(e) => handleInputChange('llm.azure.api_key', e.target.value)}
            placeholder="Enter Azure OpenAI API key"
          />
        </div>

        <div className="form-group">
          <label>Endpoint</label>
          <input
            type="text"
            value={formData.llm.azure.endpoint}
            onChange={(e) => handleInputChange('llm.azure.endpoint', e.target.value)}
            placeholder="https://your-resource.openai.azure.com"
          />
        </div>

        <div className="form-group">
          <label>Deployment Name</label>
          <input
            type="text"
            value={formData.llm.azure.deployment}
            onChange={(e) => handleInputChange('llm.azure.deployment', e.target.value)}
            placeholder="gpt-4"
          />
        </div>

        <button
          type="button"
          className="btn-test"
          onClick={() => handleTestConnection('llm', 'azure')}
          disabled={testing['llm-azure']}
        >
          {testing['llm-azure'] ? 'Testing...' : '🔍 Test Azure Connection'}
        </button>
        {renderTestResult('llm', 'azure')}
      </div>

      {/* Google Vertex AI Settings */}
      <div className="provider-section">
        <h4>Google Vertex AI</h4>

        <div className="form-group">
          <label>Project ID</label>
          <input
            type="text"
            value={formData.llm.google.project_id}
            onChange={(e) => handleInputChange('llm.google.project_id', e.target.value)}
            placeholder="your-gcp-project-id"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={formData.llm.google.location}
            onChange={(e) => handleInputChange('llm.google.location', e.target.value)}
            placeholder="us-central1"
          />
        </div>

        <div className="form-group">
          <label>Model Name</label>
          <input
            type="text"
            value={formData.llm.google.model_name}
            onChange={(e) => handleInputChange('llm.google.model_name', e.target.value)}
            placeholder="gemini-pro"
          />
        </div>

        <div className="form-group">
          <label>Service Account JSON</label>
          <textarea
            value={formData.llm.google.credentials_json}
            onChange={(e) =>
              handleInputChange('llm.google.credentials_json', e.target.value)
            }
            placeholder='{"type": "service_account", ...}'
            rows={4}
          />
        </div>

        <button
          type="button"
          className="btn-test"
          onClick={() => handleTestConnection('llm', 'google')}
          disabled={testing['llm-google']}
        >
          {testing['llm-google'] ? 'Testing...' : '🔍 Test Google Connection'}
        </button>
        {renderTestResult('llm', 'google')}
      </div>
    </div>
  );

  const renderSearchSettings = () => (
    <div className="settings-section">
      <h3>Search/RAG Provider Configuration</h3>

      <div className="form-group">
        <label>Active Provider</label>
        <select
          value={formData.search.active_provider || 'null'}
          onChange={(e) =>
            handleInputChange(
              'search.active_provider',
              e.target.value === 'null' ? null : e.target.value
            )
          }
        >
          <option value="null">Not Configured</option>
          <option value="azure">Azure AI Search</option>
          <option value="google">Google Vertex Search</option>
        </select>
      </div>

      {/* Azure AI Search Settings */}
      <div className="provider-section">
        <h4>Azure AI Search</h4>

        <div className="form-group">
          <label>Service Name</label>
          <input
            type="text"
            value={formData.search.azure.service_name}
            onChange={(e) =>
              handleInputChange('search.azure.service_name', e.target.value)
            }
            placeholder="your-search-service"
          />
        </div>

        <div className="form-group">
          <label>API Key</label>
          <input
            type="password"
            value={formData.search.azure.api_key}
            onChange={(e) => handleInputChange('search.azure.api_key', e.target.value)}
            placeholder="Enter Azure AI Search API key"
          />
        </div>

        <div className="form-group">
          <label>Index Name</label>
          <input
            type="text"
            value={formData.search.azure.index_name}
            onChange={(e) => handleInputChange('search.azure.index_name', e.target.value)}
            placeholder="your-index-name"
          />
        </div>

        <button
          type="button"
          className="btn-test"
          onClick={() => handleTestConnection('search', 'azure')}
          disabled={testing['search-azure']}
        >
          {testing['search-azure'] ? 'Testing...' : '🔍 Test Azure Connection'}
        </button>
        {renderTestResult('search', 'azure')}
      </div>

      {/* Google Vertex Search Settings */}
      <div className="provider-section">
        <h4>Google Vertex Search</h4>

        <div className="form-group">
          <label>Project ID</label>
          <input
            type="text"
            value={formData.search.google.project_id}
            onChange={(e) =>
              handleInputChange('search.google.project_id', e.target.value)
            }
            placeholder="your-gcp-project-id"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={formData.search.google.location}
            onChange={(e) => handleInputChange('search.google.location', e.target.value)}
            placeholder="global"
          />
        </div>

        <div className="form-group">
          <label>Data Store ID</label>
          <input
            type="text"
            value={formData.search.google.data_store_id}
            onChange={(e) =>
              handleInputChange('search.google.data_store_id', e.target.value)
            }
            placeholder="your-data-store-id"
          />
        </div>

        <div className="form-group">
          <label>Service Account JSON</label>
          <textarea
            value={formData.search.google.credentials_json}
            onChange={(e) =>
              handleInputChange('search.google.credentials_json', e.target.value)
            }
            placeholder='{"type": "service_account", ...}'
            rows={4}
          />
        </div>

        <button
          type="button"
          className="btn-test"
          onClick={() => handleTestConnection('search', 'google')}
          disabled={testing['search-google']}
        >
          {testing['search-google'] ? 'Testing...' : '🔍 Test Google Connection'}
        </button>
        {renderTestResult('search', 'google')}
      </div>
    </div>
  );

  const renderStorageSettings = () => (
    <div className="settings-section">
      <h3>Storage Provider Configuration</h3>

      <div className="form-group">
        <label>Active Provider</label>
        <select
          value={formData.storage.active_provider || 'null'}
          onChange={(e) =>
            handleInputChange(
              'storage.active_provider',
              e.target.value === 'null' ? null : e.target.value
            )
          }
        >
          <option value="null">Not Configured</option>
          <option value="azure">Azure Blob Storage</option>
          <option value="google">Google Cloud Storage</option>
        </select>
      </div>

      {/* Azure Blob Storage Settings */}
      <div className="provider-section">
        <h4>Azure Blob Storage</h4>

        <div className="form-group">
          <label>Connection String</label>
          <textarea
            value={formData.storage.azure.connection_string}
            onChange={(e) =>
              handleInputChange('storage.azure.connection_string', e.target.value)
            }
            placeholder="DefaultEndpointsProtocol=https;AccountName=..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Container Name</label>
          <input
            type="text"
            value={formData.storage.azure.container_name}
            onChange={(e) =>
              handleInputChange('storage.azure.container_name', e.target.value)
            }
            placeholder="qiyas-uploads"
          />
        </div>

        <button
          type="button"
          className="btn-test"
          onClick={() => handleTestConnection('storage', 'azure')}
          disabled={testing['storage-azure']}
        >
          {testing['storage-azure'] ? 'Testing...' : '🔍 Test Azure Connection'}
        </button>
        {renderTestResult('storage', 'azure')}
      </div>

      {/* Google Cloud Storage Settings */}
      <div className="provider-section">
        <h4>Google Cloud Storage</h4>

        <div className="form-group">
          <label>Bucket Name</label>
          <input
            type="text"
            value={formData.storage.google.bucket_name}
            onChange={(e) =>
              handleInputChange('storage.google.bucket_name', e.target.value)
            }
            placeholder="your-bucket-name"
          />
        </div>

        <div className="form-group">
          <label>Service Account JSON</label>
          <textarea
            value={formData.storage.google.credentials_json}
            onChange={(e) =>
              handleInputChange('storage.google.credentials_json', e.target.value)
            }
            placeholder='{"type": "service_account", ...}'
            rows={4}
          />
        </div>

        <button
          type="button"
          className="btn-test"
          onClick={() => handleTestConnection('storage', 'google')}
          disabled={testing['storage-google']}
        >
          {testing['storage-google'] ? 'Testing...' : '🔍 Test Google Connection'}
        </button>
        {renderTestResult('storage', 'google')}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="settings-form">
      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'llm' ? 'active' : ''}`}
          onClick={() => setActiveTab('llm')}
        >
          🤖 LLM
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search/RAG
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'storage' ? 'active' : ''}`}
          onClick={() => setActiveTab('storage')}
        >
          💾 Storage
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'llm' && renderLLMSettings()}
        {activeTab === 'search' && renderSearchSettings()}
        {activeTab === 'storage' && renderStorageSettings()}
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : '💾 Save Settings'}
        </button>
      </div>
    </form>
  );
}

export default SettingsForm;
