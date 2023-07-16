import styles from '../styles/Index.module.css';
import dynamic from 'next/dynamic';

export default function IndexPage() {
  // Need to import the component dynamically as it uses the 'window' property.
  // If you have found a better way of adding the component in next, please create a new issue ticket so we can update the example!
  const DeepChat = dynamic(() => import('deep-chat-react').then((mod) => mod.DeepChat), {
    ssr: false,
  });

  return (
    <>
      <main className={styles.main}>
        <div>
          <h1>Server for a custom API</h1>
          <div className={styles.components}>
            {/* If you don't want to or can't edit the target service, you can process the outgoing message using
                responseInterceptor and the incoming message using responseInterceptor:
                https://deepchat.dev/docs/interceptors */}
            <DeepChat
              containerStyle={{borderRadius: '10px'}}
              introMessage="Send a chat message to NestJS backend. "
              request={{url: '/api/basic/chat'}}
              requestInterceptor={(details: {body: any; headers?: {[key: string]: string}}) => {
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
              introMessage="Send a streamed chat message to NestJS backend."
              request={{url: '/api/basic/chat-stream'}}
              stream={true}
            />
            <DeepChat
              containerStyle={{borderRadius: '10px'}}
              introMessage="Send files to NestJS backend."
              request={{url: '/api/basic/files'}}
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
          <h1>Server for OpenAI</h1>
          <h3>Make sure to set the OPENAI_API_KEY environment variable in your server</h3>
          <div className={styles.components}>
            {/* additionalBodyProps is used to set other properties that will be sent to the server along with the message:
                https://deepchat.dev/docs/connect#request */}
            <DeepChat
              containerStyle={{borderRadius: '10px'}}
              introMessage="Send a chat message through NestJS backend to OpenAI. "
              request={{url: '/api/openai/chat', additionalBodyProps: {model: 'gpt-3.5-turbo'}}}
            />
            <DeepChat
              containerStyle={{borderRadius: '10px'}}
              introMessage="Send a streamed chat message through NestJS backend to OpenAI."
              request={{url: '/api/openai/chat-stream', additionalBodyProps: {model: 'gpt-3.5-turbo'}}}
              stream={true}
            />
            {/* You can use an example image here:
                https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image-for-openai.png */}
            <DeepChat
              containerStyle={{borderRadius: '10px'}}
              introMessage="Send a 1024x1024 .png image through NestJS backend to OpenAI and generate its variation."
              request={{url: '/api/openai/image'}}
              images={{files: {acceptedFormats: '.png'}}}
              textInput={{disabled: true, placeholder: {text: 'Send an image!'}}}
            />
          </div>
          <h1>Server for Cohere</h1>
          <h3>Make sure to set the COHERE_API_KEY environment variable in your server</h3>
          <div className={styles.components}>
            <DeepChat
              containerStyle={{borderRadius: '10px'}}
              introMessage='Insert text and Cohere will finish it for you! E.g. "Please explain to me how LLMs work"'
              request={{url: '/api/cohere/generate'}}
              textInput={{placeholder: {text: 'Once upon a time...'}}}
            />
            <DeepChat
              containerStyle={{borderRadius: '10px'}}
              introMessage="Insert text and Cohere will summarize it."
              request={{url: '/api/cohere/summarize'}}
              textInput={{placeholder: {text: 'Insert text to summarize'}}}
            />
          </div>
        </div>
      </main>
    </>
  );
}
