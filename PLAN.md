# DGA Qiyas Copilot - Implementation Plan

## Executive Summary

This document outlines the implementation plan for the DGA Qiyas Copilot, a production-grade, enterprise AI platform with multi-cloud provider support. The architecture follows a **"Startup First"** philosophy with lazy loading and the Factory Pattern for maximum flexibility and zero-downtime startup.

---

## 1. Core Principles

### 1.1 Startup First Philosophy
- **Target**: 0.5 second boot time
- **Strategy**: Zero cloud connections during startup
- **Mechanism**: All provider connections are lazily initialized
- **Fallback**: If providers not configured, app runs in "Setup Mode" guiding users to Settings

### 1.2 Lazy Loading Strategy
- **Problem**: Importing `azure.storage.blob` or `google.cloud.storage` at module level crashes on offline servers
- **Solution**: Import statements moved inside methods, only executed when needed
- **Example**:
  ```python
  # ❌ BAD - Crashes if Azure SDK not installed or offline
  from azure.storage.blob import BlobServiceClient

  class AzureStorage:
      def upload(self):
          client = BlobServiceClient(...)

  # ✅ GOOD - Only imports when method is called
  class AzureStorage:
      def upload(self):
          from azure.storage.blob import BlobServiceClient
          client = BlobServiceClient(...)
  ```

### 1.3 Factory Pattern
Three independent layers, each with its own factory function:
1. **LLM Layer**: `get_llm_service()` → Azure OpenAI | Google Vertex AI
2. **Search Layer**: `get_search_service()` → Azure AI Search | Google Vertex Search
3. **Storage Layer**: `get_storage_service()` → Azure Blob | Google Cloud Storage

---

## 2. Complete Directory Structure

```
/qiyas-copilot/
├── PLAN.md                        # This file
├── README.md                      # User documentation
├── requirements.txt               # Python dependencies
├── setup_and_run.py              # One-click automation script
├── .gitignore
│
├── /config/
│   └── settings.yaml             # Main configuration (providers = null initially)
│
├── /backend/
│   ├── main.py                   # FastAPI entry point (Uvicorn server)
│   │
│   ├── /core/
│   │   ├── __init__.py
│   │   ├── config.py             # Settings Manager (Pydantic BaseSettings)
│   │   ├── factory.py            # Master Factory (get_llm/search/storage_service)
│   │   └── database.py           # SQLite initialization (users, sessions)
│   │
│   ├── /api/
│   │   ├── __init__.py
│   │   ├── admin_routes.py       # POST /api/admin/settings, /test-connection
│   │   ├── chat_routes.py        # POST /api/chat (Deep Chat endpoint)
│   │   └── auth_routes.py        # POST /api/auth/login (LDAP + DB fallback)
│   │
│   ├── /services/
│   │   ├── __init__.py
│   │   │
│   │   ├── /interfaces/
│   │   │   ├── __init__.py
│   │   │   ├── llm_base.py       # Abstract LLMServiceInterface
│   │   │   ├── search_base.py    # Abstract SearchServiceInterface
│   │   │   └── storage_base.py   # Abstract StorageServiceInterface
│   │   │
│   │   └── /providers/
│   │       ├── __init__.py
│   │       │
│   │       ├── /llm/
│   │       │   ├── __init__.py
│   │       │   ├── azure_llm.py       # AzureOpenAIService
│   │       │   └── google_llm.py      # GoogleVertexAIService
│   │       │
│   │       ├── /search/
│   │       │   ├── __init__.py
│   │       │   ├── azure_search.py    # AzureAISearchService
│   │       │   └── google_search.py   # GoogleVertexSearchService
│   │       │
│   │       └── /storage/
│   │           ├── __init__.py
│   │           ├── azure_storage.py   # AzureBlobStorageService
│   │           └── google_storage.py  # GoogleCloudStorageService
│   │
│   └── /models/
│       ├── __init__.py
│       ├── user.py               # User DB model
│       └── chat.py               # Chat session model
│
├── /frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   │
│   ├── /src/
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Main app (Deep Chat + Settings Modal)
│   │   │
│   │   ├── /components/
│   │   │   ├── ChatInterface.jsx      # Deep Chat wrapper
│   │   │   ├── SettingsModal.jsx      # Admin settings UI
│   │   │   ├── SettingsForm.jsx       # Form with Test Connection buttons
│   │   │   └── LoginForm.jsx          # LDAP/Local login
│   │   │
│   │   ├── /services/
│   │   │   └── api.js            # Axios wrapper for backend calls
│   │   │
│   │   └── /styles/
│   │       └── App.css
│   │
│   └── /public/
│       └── favicon.ico
│
└── /data/                        # Created at runtime
    ├── qiyas.db                  # SQLite database
    └── /uploads/                 # Temp file storage (if not using cloud)
```

---

## 3. Lazy Loading Implementation Strategy

### 3.1 LLM Layer

#### Interface (`llm_base.py`)
```python
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class LLMServiceInterface(ABC):
    @abstractmethod
    async def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate AI response from conversation history"""
        pass

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """Test provider connection and credentials"""
        pass
```

#### Azure Provider (`azure_llm.py`)
```python
class AzureOpenAIService(LLMServiceInterface):
    def __init__(self, api_key: str, endpoint: str, deployment: str):
        self.api_key = api_key
        self.endpoint = endpoint
        self.deployment = deployment
        self._client = None  # Lazy initialization

    def _get_client(self):
        """Lazy import and initialization"""
        if self._client is None:
            from openai import AzureOpenAI  # Import only when needed
            self._client = AzureOpenAI(
                api_key=self.api_key,
                azure_endpoint=self.endpoint,
                api_version="2024-02-15-preview"
            )
        return self._client

    async def generate_response(self, messages, **kwargs):
        client = self._get_client()  # Triggers import on first call
        response = client.chat.completions.create(
            model=self.deployment,
            messages=messages
        )
        return response.choices[0].message.content
```

#### Google Provider (`google_llm.py`)
```python
class GoogleVertexAIService(LLMServiceInterface):
    def __init__(self, project_id: str, location: str, credentials_json: str):
        self.project_id = project_id
        self.location = location
        self.credentials_json = credentials_json
        self._client = None

    def _get_client(self):
        """Lazy import and initialization"""
        if self._client is None:
            from google.cloud import aiplatform  # Import only when needed
            from google.oauth2 import service_account
            import json

            credentials = service_account.Credentials.from_service_account_info(
                json.loads(self.credentials_json)
            )
            aiplatform.init(project=self.project_id, location=self.location, credentials=credentials)
            self._client = aiplatform
        return self._client

    async def generate_response(self, messages, **kwargs):
        client = self._get_client()
        # Implementation...
```

### 3.2 Search Layer (RAG)

Similar lazy loading pattern:
- **Interface**: `search_base.py` defines `search()` and `index_document()` methods
- **Azure**: Lazy imports `azure.search.documents`
- **Google**: Lazy imports `google.cloud.discoveryengine`

### 3.3 Storage Layer

Similar lazy loading pattern:
- **Interface**: `storage_base.py` defines `upload_file()`, `list_files()`, `delete_file()`
- **Azure**: Lazy imports `azure.storage.blob`
- **Google**: Lazy imports `google.cloud.storage`

---

## 4. Master Factory Implementation

**File**: `backend/core/factory.py`

```python
from typing import Optional
from backend.core.config import get_settings
from backend.services.interfaces.llm_base import LLMServiceInterface
from backend.services.interfaces.search_base import SearchServiceInterface
from backend.services.interfaces.storage_base import StorageServiceInterface

def get_llm_service() -> Optional[LLMServiceInterface]:
    """Factory for LLM providers - returns None if not configured"""
    settings = get_settings()
    provider = settings.llm.active_provider

    if provider == "azure":
        from backend.services.providers.llm.azure_llm import AzureOpenAIService
        return AzureOpenAIService(
            api_key=settings.llm.azure.api_key,
            endpoint=settings.llm.azure.endpoint,
            deployment=settings.llm.azure.deployment
        )
    elif provider == "google":
        from backend.services.providers.llm.google_llm import GoogleVertexAIService
        return GoogleVertexAIService(
            project_id=settings.llm.google.project_id,
            location=settings.llm.google.location,
            credentials_json=settings.llm.google.credentials_json
        )
    else:
        return None  # Not configured - Setup Mode

def get_search_service() -> Optional[SearchServiceInterface]:
    """Factory for Search/RAG providers"""
    # Similar pattern...

def get_storage_service() -> Optional[StorageServiceInterface]:
    """Factory for Storage providers"""
    # Similar pattern...
```

**Key Design Decisions**:
1. Returns `None` if provider not configured (first run)
2. Imports happen inside `if` blocks - never at module level
3. Settings loaded dynamically via `get_settings()`

---

## 5. Settings Architecture

**File**: `config/settings.yaml`

```yaml
# DGA Qiyas Copilot Configuration
# Initial state: All providers = null (Setup Mode)

llm:
  active_provider: null  # Options: azure | google | null
  azure:
    api_key: ""
    endpoint: ""
    deployment: ""
  google:
    project_id: ""
    location: ""
    credentials_json: ""

search:
  active_provider: null  # Options: azure | google | null
  azure:
    service_name: ""
    api_key: ""
    index_name: ""
  google:
    project_id: ""
    location: ""
    data_store_id: ""
    credentials_json: ""

storage:
  active_provider: null  # Options: azure | google | null
  azure:
    connection_string: ""
    container_name: ""
  google:
    bucket_name: ""
    credentials_json: ""

auth:
  ldap:
    enabled: false
    server: ""
    base_dn: ""
    user_dn_template: ""
  local_db_fallback: true

server:
  host: "0.0.0.0"
  port: 8000
  cors_origins:
    - "http://localhost:5173"
    - "http://localhost:8000"
```

**File**: `backend/core/config.py`

```python
from pydantic_settings import BaseSettings
from typing import Optional, List
import yaml
from pathlib import Path

class AzureLLMSettings(BaseSettings):
    api_key: str = ""
    endpoint: str = ""
    deployment: str = ""

class GoogleLLMSettings(BaseSettings):
    project_id: str = ""
    location: str = ""
    credentials_json: str = ""

class LLMSettings(BaseSettings):
    active_provider: Optional[str] = None
    azure: AzureLLMSettings = AzureLLMSettings()
    google: GoogleLLMSettings = GoogleLLMSettings()

# Similar for Search and Storage...

class Settings(BaseSettings):
    llm: LLMSettings
    search: SearchSettings
    storage: StorageSettings
    auth: AuthSettings
    server: ServerSettings

_settings_cache = None

def get_settings() -> Settings:
    """Singleton pattern for settings"""
    global _settings_cache
    if _settings_cache is None:
        config_path = Path(__file__).parent.parent.parent / "config" / "settings.yaml"
        with open(config_path) as f:
            config_data = yaml.safe_load(f)
        _settings_cache = Settings(**config_data)
    return _settings_cache

def reload_settings():
    """Force reload settings (called after admin updates)"""
    global _settings_cache
    _settings_cache = None
    return get_settings()
```

---

## 6. Admin API Specification

**File**: `backend/api/admin_routes.py`

### Endpoints

#### 6.1 Update Settings
```
POST /api/admin/settings
Content-Type: application/json

Request Body:
{
  "llm": {
    "active_provider": "azure",
    "azure": {
      "api_key": "sk-...",
      "endpoint": "https://...",
      "deployment": "gpt-4"
    }
  }
}

Response:
{
  "status": "success",
  "message": "Settings updated successfully"
}
```

**Logic**:
1. Validate incoming JSON against Settings schema
2. Write to `config/settings.yaml`
3. Call `reload_settings()` to refresh in-memory cache
4. Return success

#### 6.2 Test Connection
```
POST /api/admin/test-connection
Content-Type: application/json

Request Body:
{
  "service_type": "storage",  // Options: llm | search | storage
  "provider": "azure",
  "config": {
    "connection_string": "...",
    "container_name": "test-container"
  }
}

Response (Success):
{
  "status": "success",
  "message": "Successfully connected to Azure Blob Storage",
  "details": {
    "container_exists": true,
    "test_file_uploaded": true
  }
}

Response (Failure):
{
  "status": "error",
  "message": "Invalid connection string",
  "error_code": "AUTH_FAILED"
}
```

**Logic**:
1. Dynamically instantiate the provider with test config
2. Call provider's `test_connection()` method
3. Catch exceptions and return friendly error messages
4. Do NOT save config (only testing)

---

## 7. Chat API with Deep Chat

**File**: `backend/api/chat_routes.py`

### Endpoint
```
POST /api/chat
Content-Type: multipart/form-data

Request:
- message: "Can you analyze this PDF?"
- files: [file1.pdf, file2.png]

Response (Streaming):
{
  "role": "assistant",
  "content": "I've analyzed the PDF and found..."
}
```

**Data Flow**:
1. Receive message + files from Deep Chat
2. If files exist:
   - Call `get_storage_service().upload_file(file)` → Get URL
   - Add file references to context
3. Call `get_llm_service().generate_response(messages)`
4. Optionally call `get_search_service().search(query)` for RAG
5. Return AI response to Deep Chat

**Error Handling**:
- If `get_llm_service()` returns `None` → Return error: "LLM not configured. Please configure in Settings."
- If storage fails → Fall back to in-memory processing

---

## 8. Authentication Flow

**File**: `backend/api/auth_routes.py`

### Login Endpoint
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "username": "john.doe",
  "password": "SecureP@ss123"
}

Response:
{
  "status": "success",
  "token": "jwt-token-here",
  "user": {
    "username": "john.doe",
    "display_name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Logic**:
1. Check if LDAP enabled in `settings.yaml`
2. If LDAP enabled:
   - Lazy import `ldap3`
   - Bind to LDAP server
   - Authenticate user
   - If success → Create/update user in local DB → Generate JWT
   - If LDAP fails and `local_db_fallback=true` → Try local DB
3. If LDAP disabled:
   - Authenticate against local SQLite DB (bcrypt hashed passwords)
4. Return JWT token for subsequent requests

---

## 9. Frontend Architecture

**File**: `frontend/src/App.jsx`

```jsx
import { useState } from 'react'
import { DeepChat } from 'deep-chat-react'
import SettingsModal from './components/SettingsModal'
import './styles/App.css'

function App() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="app-container">
      {/* Header with Settings Button */}
      <header>
        <h1>DGA Qiyas Copilot</h1>
        <button onClick={() => setShowSettings(true)}>⚙️ Settings</button>
      </header>

      {/* Deep Chat Component */}
      <DeepChat
        request={{
          url: "http://localhost:8000/api/chat",
          method: "POST"
        }}
        textInput={{ placeholder: { text: "Ask me anything..." } }}
        fileAttachments={{ enabled: true }}
        stream={true}
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

export default App
```

**File**: `frontend/src/components/SettingsForm.jsx`

Key Features:
- Tabs for LLM / Search / Storage
- Dropdown to select provider (Azure / Google)
- Input fields for credentials (masked for API keys)
- **Test Connection** button for each service
- **Save** button to POST to `/api/admin/settings`
- Visual indicators (✅ Connected / ❌ Error)

---

## 10. Automation Script

**File**: `setup_and_run.py`

```python
#!/usr/bin/env python3
"""
DGA Qiyas Copilot - One-Click Setup and Run Script
Handles: Virtual Env, Dependencies, Frontend Build, Server Start
"""
import os
import sys
import subprocess
import platform
from pathlib import Path

def main():
    print("🚀 DGA Qiyas Copilot - Setup and Run\n")

    # Step 1: Virtual Environment
    if not Path("venv").exists():
        print("📦 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])

    # Determine venv activation
    if platform.system() == "Windows":
        python_exec = "venv\\Scripts\\python.exe"
        pip_exec = "venv\\Scripts\\pip.exe"
    else:
        python_exec = "venv/bin/python"
        pip_exec = "venv/bin/pip"

    # Step 2: Install Backend Dependencies
    print("📚 Installing Python dependencies...")
    subprocess.run([pip_exec, "install", "-r", "requirements.txt"])

    # Step 3: Build Frontend (if npm available)
    frontend_dist = Path("frontend/dist")
    if not frontend_dist.exists():
        print("🎨 Building React frontend...")
        try:
            os.chdir("frontend")
            subprocess.run(["npm", "install"])
            subprocess.run(["npm", "run", "build"])
            os.chdir("..")
        except FileNotFoundError:
            print("⚠️  npm not found. Assuming frontend is pre-built.")

    # Step 4: Initialize Database
    print("💾 Initializing SQLite database...")
    # Database auto-creates on first run via backend/core/database.py

    # Step 5: Start Server
    print("\n✅ Starting FastAPI server...\n")
    subprocess.run([
        python_exec, "-m", "uvicorn",
        "backend.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ])

if __name__ == "__main__":
    main()
```

**Usage**:
```bash
python setup_and_run.py
```

---

## 11. Implementation Sequence

### Phase 1: Core Infrastructure (Files 1-8)
1. ✅ `config/settings.yaml` - Default configuration (all providers = null)
2. ✅ `backend/core/config.py` - Settings manager with Pydantic
3. ✅ `backend/core/database.py` - SQLite initialization
4. ✅ `backend/services/interfaces/llm_base.py` - LLM interface
5. ✅ `backend/services/interfaces/search_base.py` - Search interface
6. ✅ `backend/services/interfaces/storage_base.py` - Storage interface
7. ✅ `backend/core/factory.py` - Master factory with lazy loading
8. ✅ `backend/models/user.py` & `chat.py` - DB models

### Phase 2: Provider Implementations (Files 9-14)
9. ✅ `backend/services/providers/llm/azure_llm.py`
10. ✅ `backend/services/providers/llm/google_llm.py`
11. ✅ `backend/services/providers/search/azure_search.py`
12. ✅ `backend/services/providers/search/google_search.py`
13. ✅ `backend/services/providers/storage/azure_storage.py`
14. ✅ `backend/services/providers/storage/google_storage.py`

### Phase 3: API Layer (Files 15-18)
15. ✅ `backend/api/auth_routes.py` - Login/LDAP
16. ✅ `backend/api/admin_routes.py` - Settings + Test Connection
17. ✅ `backend/api/chat_routes.py` - Deep Chat endpoint
18. ✅ `backend/main.py` - FastAPI app entry point

### Phase 4: Frontend (Files 19-24)
19. ✅ `frontend/package.json` - Dependencies
20. ✅ `frontend/vite.config.js` - Build config
21. ✅ `frontend/index.html` - HTML entry
22. ✅ `frontend/src/main.jsx` - React entry
23. ✅ `frontend/src/App.jsx` - Main app with Deep Chat
24. ✅ `frontend/src/components/SettingsModal.jsx` & `SettingsForm.jsx`

### Phase 5: Automation & Documentation (Files 25-27)
25. ✅ `requirements.txt` - All Python dependencies
26. ✅ `setup_and_run.py` - One-click automation
27. ✅ `README.md` - User guide

---

## 12. Critical Implementation Notes

### 12.1 Lazy Import Checklist
- [ ] **Never** import cloud SDKs at module level
- [ ] All provider classes must have `_get_client()` method
- [ ] Imports happen inside `_get_client()` or similar methods
- [ ] Factory functions import providers inside `if` blocks

### 12.2 Error Handling
- [ ] All factory functions return `None` if provider not configured
- [ ] Chat API checks if LLM service is `None` before calling
- [ ] Admin API wraps test connections in try/except with friendly errors
- [ ] LDAP failures fall back to local DB if enabled

### 12.3 Security
- [ ] All API keys stored in `settings.yaml` (gitignored)
- [ ] JWT tokens for session management
- [ ] CORS properly configured for frontend domain
- [ ] LDAP credentials never logged

### 12.4 Performance
- [ ] Settings cached in memory (singleton pattern)
- [ ] Provider clients reused (lazy init, but cached after first call)
- [ ] SQLite with connection pooling
- [ ] Frontend built for production (Vite minification)

---

## 13. Testing Strategy

### 13.1 Backend Tests
```bash
# Test factory returns None when unconfigured
python -m pytest tests/test_factory.py::test_unconfigured_returns_none

# Test lazy imports don't crash
python -m pytest tests/test_lazy_loading.py

# Test admin API updates settings
python -m pytest tests/test_admin_routes.py
```

### 13.2 Frontend Tests
```bash
cd frontend
npm run test

# Test Settings Modal renders
# Test Deep Chat connects to backend
```

### 13.3 Integration Tests
```bash
# Test full flow: Login → Chat → File Upload → LLM Response
python -m pytest tests/integration/test_full_flow.py
```

---

## 14. Deployment Checklist

### 14.1 First-Time Setup
1. Clone repository
2. Run `python setup_and_run.py`
3. Access `http://localhost:8000`
4. Click "Settings" → Configure at least one LLM provider
5. Click "Test Connection" → Verify ✅
6. Click "Save" → Settings persisted
7. Start chatting!

### 14.2 Production Deployment
1. Set `server.host` to actual domain in `settings.yaml`
2. Update `cors_origins` to include production URL
3. Use environment variables for secrets (override `settings.yaml`)
4. Run behind reverse proxy (nginx/Caddy)
5. Enable HTTPS
6. Set up log rotation
7. Configure database backups (SQLite → periodic snapshots)

---

## 15. Success Criteria

- ✅ **0.5s Startup**: App starts instantly without cloud connections
- ✅ **Zero Crashes**: Missing Azure/Google SDKs don't crash the app
- ✅ **Setup Mode**: First run shows "Configure Settings" UI
- ✅ **One Command**: `python setup_and_run.py` does everything
- ✅ **Test Buttons**: Admin can test each provider before saving
- ✅ **Multi-Cloud**: Switch between Azure/Google without code changes
- ✅ **Secure**: LDAP + JWT authentication, no hardcoded secrets
- ✅ **Production-Ready**: Error handling, logging, type hints, documentation

---

## 16. Future Enhancements (Post-MVP)

- **Multi-Model Support**: Allow multiple LLMs simultaneously (routing logic)
- **Advanced RAG**: Hybrid search (keyword + semantic)
- **Audit Logging**: Track all admin changes and chat sessions
- **Role-Based Access**: Admin vs User permissions
- **Monitoring Dashboard**: Real-time metrics (requests/sec, token usage)
- **Docker Support**: Single container deployment
- **Kubernetes**: Helm chart for enterprise clusters

---

## Appendix A: Key Dependencies

**Backend** (`requirements.txt`):
- fastapi==0.109.0
- uvicorn[standard]==0.27.0
- pydantic-settings==2.1.0
- pyyaml==6.0.1
- python-multipart==0.0.6
- ldap3==2.9.1
- sqlalchemy==2.0.25
- bcrypt==4.1.2
- python-jose[cryptography]==3.3.0
- openai==1.10.0 (Azure OpenAI)
- google-cloud-aiplatform==1.40.0
- azure-search-documents==11.4.0
- google-cloud-discoveryengine==0.11.0
- azure-storage-blob==12.19.0
- google-cloud-storage==2.14.0

**Frontend** (`package.json`):
- react==18.2.0
- react-dom==18.2.0
- deep-chat-react==2.0.0
- axios==1.6.5
- vite==5.0.11

---

## Appendix B: File Size Estimates

| Component | Files | LOC Est. | Complexity |
|-----------|-------|----------|------------|
| Core      | 4     | ~500     | Medium     |
| Interfaces| 3     | ~150     | Low        |
| Providers | 6     | ~1200    | High       |
| API       | 4     | ~800     | Medium     |
| Frontend  | 6     | ~600     | Medium     |
| Config    | 3     | ~200     | Low        |
| **Total** | **26**| **~3450**| **Medium** |

---

**End of Implementation Plan**

**Status**: ✅ Ready for Approval
**Next Step**: Await user approval, then proceed to Phase 1 implementation

---

**Document Version**: 1.0
**Last Updated**: 2026-01-05
**Author**: Enterprise Solution Architect (Claude)
