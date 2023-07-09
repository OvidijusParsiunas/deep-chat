import {DeepChat} from 'deep-chat-react';
import './App.css';

function App() {
  return (
    <div className="App">
      <div>
        <h1>
          Deep Chat test ground for{' '}
          <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers">Example Servers</a>
        </h1>
        <h1>Server</h1>
        <div className="components">
          {/* you can add the requestBodyMessageLimits property to limit the number of messages included in the request:
              requestBodyMessageLimits={{maxMessages: 1}} - https://deepchat.dev/docs/connect#requestBodyMessageLimits */}
          <DeepChat
            containerStyle={{borderRadius: '10px'}}
            introMessage="Send a chat message to an example server. "
            request={{url: 'http://localhost:8080/chat'}}
          />
          <DeepChat
            containerStyle={{borderRadius: '10px'}}
            introMessage="Send a streamed chat message to an example server."
            request={{url: 'http://localhost:8080/chat-stream'}}
            stream={true}
          />
          <DeepChat
            containerStyle={{borderRadius: '10px'}}
            introMessage="Send files to an example server."
            request={{url: 'http://localhost:8080/files'}}
            audio={true}
            images={true}
            gifs={true}
            camera={true}
            microphone={true}
            mixedFiles={true}
            requestBodyMessageLimits={{maxMessages: 1}}
          />
        </div>
        <h1>Server for OpenAI</h1>
        <h3>Make sure to set the OPENAI_API_KEY environment variable in your server</h3>
        <div className="components">
          {/* you can add the requestBodyMessageLimits property to limit the number of messages included in the request:
              requestBodyMessageLimits={{maxMessages: 1}} - https://deepchat.dev/docs/connect#requestBodyMessageLimits */}
          {/* additionalBodyProps is used to set other properties that will be sent to the server along with the message:
              https://deepchat.dev/docs/connect#request */}
          <DeepChat
            containerStyle={{borderRadius: '10px'}}
            introMessage="Send a chat message through an example server to OpenAI. "
            request={{url: 'http://localhost:8080/openai-chat', additionalBodyProps: {model: 'gpt-3.5-turbo'}}}
          />
          <DeepChat
            containerStyle={{borderRadius: '10px'}}
            introMessage="Send a streamed chat message through an example server to OpenAI."
            request={{url: 'http://localhost:8080/openai-chat-stream', additionalBodyProps: {model: 'gpt-3.5-turbo'}}}
            stream={true}
          />
          <DeepChat
            containerStyle={{borderRadius: '10px'}}
            introMessage="Send a 1024x1024 .png image through an example server to OpenAI and generate its variation."
            request={{url: 'http://localhost:8080/openai-image'}}
            images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
            requestBodyMessageLimits={{maxMessages: 1}}
            textInput={{disabled: true, placeholder: {text: 'Send an image!'}}}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
