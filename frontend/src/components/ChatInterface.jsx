import { useState, useEffect } from 'react';
import { DeepChat } from 'deep-chat-react';

function ChatInterface() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Generate or retrieve session ID
    const savedSessionId = localStorage.getItem('current_session_id');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      localStorage.setItem('current_session_id', newSessionId);
    }
  }, []);

  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    localStorage.setItem('current_session_id', newSessionId);
    window.location.reload(); // Reload to clear chat
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat</h2>
        <button className="btn-secondary" onClick={handleNewChat}>
          ➕ New Chat
        </button>
      </div>

      <div className="chat-content">
        <DeepChat
          style={{
            borderRadius: '8px',
            width: '100%',
            height: '100%',
          }}
          request={{
            url: '/api/chat',
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            additionalBodyProps: {
              session_id: sessionId,
            },
          }}
          requestBodyLimits={{
            maxMessages: -1,
            maxCharacters: 10000,
          }}
          messageStyles={{
            default: {
              shared: {
                bubble: {
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  padding: '12px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                },
              },
              user: {
                bubble: {
                  backgroundColor: '#007bff',
                  color: '#fff',
                },
              },
              ai: {
                bubble: {
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                },
              },
            },
          }}
          textInput={{
            placeholder: {
              text: 'Ask me anything...',
              style: { color: '#999' },
            },
            styles: {
              container: {
                borderRadius: '8px',
                border: '1px solid #ddd',
                padding: '8px',
              },
            },
          }}
          submitButtonStyles={{
            submit: {
              container: {
                default: {
                  backgroundColor: '#007bff',
                },
                hover: {
                  backgroundColor: '#0056b3',
                },
              },
            },
          }}
          attachmentContainerStyle={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '8px',
          }}
          errorMessages={{
            displayServiceErrorMessages: true,
            overrides: {
              default: 'An error occurred. Please try again.',
            },
          }}
          initialMessages={[
            {
              role: 'ai',
              text: 'Hello! I am the DGA Qiyas Copilot. How can I help you today?',
            },
          ]}
          stream={false}
          fileAttachments={{
            enabled: true,
            button: {
              position: 'inside-left',
            },
            infoModal: {
              textMarkDown:
                'Attach files (PDF, images, documents) to include in your chat.',
            },
          }}
          microphone={{
            enabled: false,
          }}
          camera={{
            enabled: false,
          }}
          audio={{
            enabled: false,
          }}
          gifs={{
            enabled: false,
          }}
        />
      </div>
    </div>
  );
}

export default ChatInterface;
