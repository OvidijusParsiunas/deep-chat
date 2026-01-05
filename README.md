# 🤖 DGA Qiyas Copilot

Enterprise-grade AI platform with multi-cloud provider support, featuring lazy loading, modular architecture, and zero-downtime startup.

## ✨ Key Features

- **🚀 Startup First**: Application starts in < 0.5 seconds with no cloud connections during boot
- **🔌 Multi-Cloud Support**: Seamlessly switch between Azure and Google Cloud providers
- **🏗️ Modular Architecture**: Factory pattern with lazy loading for all cloud SDKs
- **⚙️ Setup Mode**: First-run guides admins to configure providers via Settings UI
- **🔐 Enterprise Authentication**: LDAP + local DB fallback with JWT tokens
- **💬 Deep Chat Integration**: Modern chat interface with file upload support
- **📦 One-Click Setup**: Single command to set up and run the entire application

## 🏛️ Architecture

### The "Big Three" Abstraction Layers

1. **LLM Layer**: Azure OpenAI ↔ Google Vertex AI
2. **Search Layer (RAG)**: Azure AI Search ↔ Google Vertex Search
3. **Storage Layer**: Azure Blob Storage ↔ Google Cloud Storage

### Lazy Loading Strategy

All cloud provider SDKs are imported **inside methods**, not at module level. This ensures:
- ✅ App starts instantly even without cloud SDKs installed
- ✅ No crashes on offline servers
- ✅ Minimal memory footprint
- ✅ Only load what you use

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- Node.js 18+ and npm (optional, for frontend)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Qiyas-Copilot

# Run the one-click setup script
python setup_and_run.py
```

That's it! The script will:
1. Create a virtual environment
2. Install all Python dependencies
3. Build the React frontend (if npm available)
4. Start the FastAPI server

### Access the Application

- **Frontend**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **Admin Settings**: Click "⚙️ Settings" after login

### First-Time Setup

1. Register a new user (first user is automatically admin)
2. Login with your credentials
3. You'll see "Setup Mode" - click "Open Settings"
4. Configure at least one LLM provider:
   - **Azure OpenAI**: Enter API key, endpoint, and deployment name
   - **Google Vertex AI**: Enter project ID, location, and credentials JSON
5. Click "Test Connection" to verify
6. Click "Save Settings"
7. Start chatting!

## 📁 Project Structure

```
qiyas-copilot/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── core/
│   │   ├── config.py              # Settings manager
│   │   ├── factory.py             # Provider factory (lazy loading)
│   │   └── database.py            # SQLite initialization
│   ├── api/
│   │   ├── auth_routes.py         # Authentication (LDAP + local)
│   │   ├── admin_routes.py        # Settings management
│   │   └── chat_routes.py         # Deep Chat integration
│   ├── services/
│   │   ├── interfaces/            # Abstract base classes
│   │   └── providers/             # Azure & Google implementations
│   └── models/                    # Database models
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main app component
│   │   ├── components/            # React components
│   │   └── services/api.js        # Backend API client
│   └── package.json
├── config/
│   └── settings.yaml              # Configuration (all providers = null initially)
├── requirements.txt               # Python dependencies
├── setup_and_run.py              # One-click automation script
└── README.md
```

## ⚙️ Configuration

### Settings File

Edit `config/settings.yaml` to configure providers:

```yaml
llm:
  active_provider: azure  # or google, or null
  azure:
    api_key: "your-api-key"
    endpoint: "https://your-resource.openai.azure.com"
    deployment: "gpt-4"

search:
  active_provider: null  # Optional - for RAG

storage:
  active_provider: null  # Optional - for file uploads

auth:
  ldap:
    enabled: false  # Set to true for LDAP
    server: "ldap.example.com"
  local_db_fallback: true  # Local DB auth always available
```

### Environment Variables

Override settings with environment variables (higher priority):

```bash
export QIYAS_LLM_ACTIVE_PROVIDER=azure
export QIYAS_LLM_AZURE_API_KEY=your-key
```

## 🔐 Authentication

### Local Database

Default authentication method. Users are stored in SQLite.

```bash
# Register new user
POST /api/auth/register
{
  "username": "admin",
  "password": "secure-password",
  "email": "admin@example.com"
}
```

### LDAP

Enterprise LDAP authentication with local DB fallback.

1. Configure in `settings.yaml`:
```yaml
auth:
  ldap:
    enabled: true
    server: "ldap.example.com"
    port: 389
    base_dn: "dc=example,dc=com"
    user_dn_template: "uid={username},ou=users,dc=example,dc=com"
```

2. Users auto-created on first LDAP login

## 🔧 Provider Configuration

### Azure OpenAI

1. Create Azure OpenAI resource
2. Deploy a model (e.g., gpt-4)
3. Get API key and endpoint
4. Configure in Settings UI

### Google Vertex AI

1. Create GCP project
2. Enable Vertex AI API
3. Create service account with Vertex AI permissions
4. Download JSON key
5. Configure in Settings UI

### Azure AI Search

1. Create Azure AI Search service
2. Create search index
3. Get admin API key
4. Configure in Settings UI

### Google Vertex Search

1. Create Vertex Search data store
2. Import documents
3. Get service account credentials
4. Configure in Settings UI

### Azure Blob Storage

1. Create Storage Account
2. Create container (e.g., "qiyas-uploads")
3. Get connection string
4. Configure in Settings UI

### Google Cloud Storage

1. Create GCS bucket
2. Set up service account with Storage Admin role
3. Download JSON key
4. Configure in Settings UI

## 🧪 Testing Provider Connections

Use the "Test Connection" buttons in Settings UI to verify:
- ✅ Credentials are valid
- ✅ Services are accessible
- ✅ Permissions are correct

Test results are shown immediately without saving configuration.

## 🛠️ Development

### Backend Development

```bash
# Activate virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Run development server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run dev server (with proxy to backend)
npm run dev

# Build for production
npm run build
```

### Database Management

```python
# Initialize database
from backend.core.database import init_db
init_db()

# Reset database (WARNING: deletes all data)
from backend.core.database import reset_db
reset_db()
```

## 📊 API Documentation

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Key Endpoints

**Authentication**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

**Admin**
- `GET /api/admin/settings` - Get settings
- `POST /api/admin/settings` - Update settings
- `POST /api/admin/test-connection` - Test provider
- `GET /api/admin/provider-status` - Check provider status

**Chat**
- `POST /api/chat` - Send message (with optional files)
- `GET /api/chat/sessions` - List sessions
- `GET /api/chat/sessions/{id}` - Get session history
- `DELETE /api/chat/sessions/{id}` - Delete session

## 🔒 Security Best Practices

1. **Change JWT Secret**: Update `auth.jwt_secret` in settings.yaml
2. **Use HTTPS**: Deploy behind reverse proxy (nginx/Caddy)
3. **Rotate API Keys**: Regularly rotate cloud provider credentials
4. **Backup Database**: Schedule periodic backups of `data/qiyas.db`
5. **Gitignore Secrets**: Never commit `config/settings.yaml` with credentials

## 🐛 Troubleshooting

### App won't start

```bash
# Check Python version
python --version  # Must be 3.9+

# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### LLM provider errors

1. Check Settings UI: Click "Test Connection"
2. Verify API keys are correct
3. Check cloud provider quotas/limits
4. Ensure services are enabled in cloud console

### Frontend not loading

```bash
cd frontend
npm install
npm run build
```

### Database errors

```python
# Reset database
from backend.core.database import reset_db
reset_db()
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the GitHub repository.

---

**Built with ❤️ for Enterprise AI**
