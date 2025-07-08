# Deep Chat with Salesforce Agentforce

This guide shows you how to integrate **Deep Chat** with **Salesforce Agentforce** using the Agent API. With this setup, you can create a streaming chat interface that connects directly to your Salesforce agents.

## :rocket: Quick Start

### 1. Install Deep Chat

```bash
npm install deep-chat
```

### 2. Add Deep Chat to Your HTML

```html
<deep-chat
  style="width: 100%; height: 600px; border-radius: 10px"
  connect='{"url": "/api/salesforce/agentforce-stream", "stream": true}'
  request-body-limits='{"maxMessages": -1}'
  error-messages='{"displayServiceErrorMessages": true}'>
</deep-chat>
```

## :gear: Salesforce Setup

### Prerequisites

- Salesforce org with Agentforce enabled
- At least one activated agent (not "Agentforce (Default)" type)
- See [Salesforce Agent API Documentation](https://developer.salesforce.com/docs/einstein/genai/guide/agent-api-get-started.html)

### 1. Create a Connected App

1. Go to **Setup** > **Apps** > **External Client Apps** > **Settings**
2. Turn on **Allow creation of connected apps**
3. Click **New Connected App**
4. Configure the app:
   - **Connected App Name**: Choose a name for your app
   - **Contact Email**: Your admin email
   - **Enable OAuth Settings**: ✓
   - **Callback URL**: `https://login.salesforce.com`
   - **OAuth Scopes**: Add these scopes:
     - Access chatbot services (chatbot_api)
     - Access the Salesforce API Platform (sfap_api)
     - Manage user data via APIs (api)
     - Perform requests at any time (refresh_token, offline_access)
   - **Enable Client Credentials Flow**: ✓
   - **Issue JSON Web Token (JWT)-based access tokens**: ✓

### 2. Configure OAuth Policies

1. After saving, go to **Manage** > **Edit Policies**
2. Set **Permitted Users** to appropriate users
3. Set **Run As** to a user with API access
4. Save the configuration

### 3. Add Connected App to Agent

1. Go to **Setup** > **Agentforce Agents**
2. Select your agent
3. Go to **Connections** tab
4. Click **Add** and select your connected app

### 4. Get Your Credentials

1. Go to **Setup** > **App Manager**
2. Find your connected app and click **View**
3. Click **Manage Consumer Details**
4. Copy the **Consumer Key** and **Consumer Secret**
5. Get your **My Domain URL** from **Setup** > **My Domain**

## :computer: Server Implementation

### Environment Variables

Create a `.env` file with your Salesforce credentials:

```env
SALESFORCE_INSTANCE_URL=https://yourdomain.my.salesforce.com
SALESFORCE_CLIENT_ID=your_consumer_key
SALESFORCE_CLIENT_SECRET=your_consumer_secret
SALESFORCE_AGENT_ID=your_agent_id
```

### Install Dependencies

```bash
npm install
```

## :zap: Running the Example

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Think2Corp/deep-chat.git
   cd deep-chat/example-servers/sveltekit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file with your Salesforce credentials

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to the chat interface

## :wrench: Customization

### Custom Styling

You can customize the appearance of Deep Chat:

```html
<deep-chat 
  connect='{"url": "/api/salesforce/agentforce-stream", "stream": true}'
  style="width: 100%; height: 600px; border-radius: 10px;"
  theme='{"colors": {"primary": "#0176D3"}}'>
</deep-chat>
```

### Add User Avatars

```html
<deep-chat 
  connect='{"url": "/api/salesforce/agentforce-stream", "stream": true}'
  avatars='{"default": {"src": "agent-avatar.png"}, "user": {"src": "user-avatar.png"}}'>
</deep-chat>
```

## :books: Additional Resources

- [Salesforce Agent API Documentation](https://developer.salesforce.com/docs/einstein/genai/guide/agent-api-get-started.html)
- [Deep Chat Documentation](https://deepchat.dev/)
- [Agent API Examples](https://developer.salesforce.com/docs/einstein/genai/guide/agent-api-examples.html)
- [Agent API Postman Collection](https://www.postman.com/salesforce-developers/salesforce-developers/collection/gwv9bjy/agent-api)
