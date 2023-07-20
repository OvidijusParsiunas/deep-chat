import {RequestDetails} from 'deep-chat/dist/types/interceptors';
import {DeepChat} from 'deep-chat-react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1 id="page-title">
        Deep Chat test ground for{' '}
        <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers">Example Servers</a>
      </h1>
      <h1>Server for a custom API</h1>
      <div className="components">
        <div className="diagonal-line" style={{background: '#e8f5ff'}}></div>
        {/* by setting maxMessages requestBodyLimits to 0 or lower - each request will send full chat history:
            https://deepchat.dev/docs/connect/#requestBodyLimits */}
        {/* If you don't want to or can't edit the target service, you can process the outgoing message using
            responseInterceptor and the incoming message using responseInterceptor:
            https://deepchat.dev/docs/interceptors */}
        <DeepChat
          containerStyle={{borderRadius: '10px'}}
          introMessage="Send a chat message to an example server. "
          request={{url: 'http://localhost:8080/chat'}}
          requestBodyLimits={{maxMessages: -1}}
          requestInterceptor={(details: RequestDetails) => {
            console.log(details);
            return details;
          }}
          responseInterceptor={(response: any) => {
            console.log(response);
            return response;
          }}
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
          textInput={{placeholder: {text: 'Send a file!'}}}
          validateMessageBeforeSending={(_?: string, files?: File[]) => {
            return files && files.length > 0;
          }}
        />
      </div>
      <h1 className="server-title">Server for OpenAI</h1>
      <a href="https://openai.com/blog/openai-api" target="_blank" rel="noreferrer">
        <img
          className="server-title-icon"
          src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/openAILogo.png"
          style={{width: 26, marginBottom: '-1px'}}
          alt={'Title icon'}
        />
      </a>
      <h3>Make sure to set the OPENAI_API_KEY environment variable in your server</h3>
      <div className="components">
        <div className="diagonal-line" style={{background: '#f2f2f2'}}></div>
        {/* additionalBodyProps is used to set other properties that will be sent to the server along with the message:
            https://deepchat.dev/docs/connect#request */}
        {/* by setting maxMessages requestBodyLimits to 0 or lower - each request will send full chat history:
            https://deepchat.dev/docs/connect/#requestBodyLimits */}
        <DeepChat
          containerStyle={{borderRadius: '10px'}}
          introMessage="Send a chat message through an example server to OpenAI."
          request={{url: 'http://localhost:8080/openai-chat', additionalBodyProps: {model: 'gpt-3.5-turbo'}}}
          requestBodyLimits={{maxMessages: -1}}
          errorMessages={{displayServiceErrorMessages: true}}
        />
        <DeepChat
          containerStyle={{borderRadius: '10px'}}
          introMessage="Send a streamed chat message through an example server to OpenAI."
          request={{url: 'http://localhost:8080/openai-chat-stream', additionalBodyProps: {model: 'gpt-3.5-turbo'}}}
          requestBodyLimits={{maxMessages: -1}}
          stream={true}
          errorMessages={{displayServiceErrorMessages: true}}
        />
        {/* If not using the camera, you can use an example image here:
            https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image-for-openai.png */}
        <DeepChat
          containerStyle={{borderRadius: '10px'}}
          introMessage="Send a 1024x1024 .png image through an example server to OpenAI, which will generate its variation."
          request={{url: 'http://localhost:8080/openai-image'}}
          camera={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
          images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
          textInput={{disabled: true, placeholder: {text: 'Send an image!'}}}
          errorMessages={{displayServiceErrorMessages: true}}
        />
      </div>

      <h1 className="server-title">Server for Hugging Face</h1>
      <a href="https://learn.microsoft.com/en-gb/azure/cognitive-services/" target="_blank" rel="noreferrer">
        <img
          className="server-title-icon"
          src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/huggingFaceLogo.png"
          style={{width: 36, marginBottom: '-6px', marginLeft: '7px'}}
          alt={'Title icon'}
        />
      </a>
      <h3>Make sure to set the HUGGING_FACE_API_KEY environment variable in your server</h3>
      <div className="components">
        <div className="diagonal-line" style={{background: '#fffdd9'}}></div>
        {/* by setting maxMessages requestBodyLimits to 0 or lower - each request will send full chat history:
            https://deepchat.dev/docs/connect/#requestBodyLimits */}
        <DeepChat
          containerStyle={{borderRadius: '10px'}}
          introMessage="Send a conversation message through an example server to Hugging Face."
          requestBodyLimits={{maxMessages: -1}}
          request={{url: 'http://localhost:8080/huggingface-conversation'}}
          errorMessages={{displayServiceErrorMessages: true}}
        />
        {/* If not using the camera, you can use an example image here:
            https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png */}
        <DeepChat
          containerStyle={{borderRadius: '10px'}}
          introMessage="Send an image through an example server to Hugging Face and retrieve its classification."
          request={{url: 'http://localhost:8080/huggingface-image'}}
          camera={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
          images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
          textInput={{disabled: true, placeholder: {text: 'Send an image!'}}}
          errorMessages={{displayServiceErrorMessages: true}}
        />
        {/* If not using the microphone, you can send an example audio file here:
            https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-audio.m4a */}
        <DeepChat
          containerStyle={{borderRadius: '10px'}}
          introMessage="Send an audio file through an example server to Hugging Face and recieve its transcript."
          request={{url: 'http://localhost:8080/huggingface-speech'}}
          audio={{files: {maxNumberOfFiles: 1}}}
          microphone={{files: {maxNumberOfFiles: 1}}}
          textInput={{disabled: true, placeholder: {text: 'Send an audio file!'}}}
          errorMessages={{displayServiceErrorMessages: true}}
        />
      </div>

      <h1 className="server-title">Server for Cohere</h1>
      <a href="https://docs.cohere.com/docs" target="_blank" rel="noreferrer">
        <img
          className="server-title-icon"
          src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/cohereLogo.png"
          style={{width: 37, marginBottom: '-8px', marginLeft: '5px'}}
          alt={'Title icon'}
        />
      </a>
      <h3>Make sure to set the COHERE_API_KEY environment variable in your server</h3>
      <div className="components">
        <div className="diagonal-line" style={{background: '#fff2fd'}}></div>
        <DeepChat
          containerStyle={{borderRadius: '10px'}}
          introMessage='Send start text through an example server to Cohere and receive its genereated completion. E.g. "Please explain to me how LLMs work"'
          request={{url: 'http://localhost:8080/cohere-generate'}}
          textInput={{placeholder: {text: 'Once upon a time...'}}}
          errorMessages={{displayServiceErrorMessages: true}}
        />
        <DeepChat
          containerStyle={{borderRadius: '10px'}}
          introMessage="Send text through an example server to Cohere and receive its summary."
          request={{url: 'http://localhost:8080/cohere-summarize'}}
          textInput={{placeholder: {text: 'Insert text to summarize'}}}
          errorMessages={{displayServiceErrorMessages: true}}
        />
      </div>
    </div>
  );
}

export default App;
