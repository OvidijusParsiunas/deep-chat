import styles from '../styles/Index.module.css';
import dynamic from 'next/dynamic';

export default function IndexPage() {
  // need to import the component dynamically as it uses the 'window' property
  // to calculate its dimensions and listen to user input events - which are only
  // available in the browser
  // if you have found a better way of adding the component in next, please create a new
  // issue ticket so we can update the example!
  const DeepChat = dynamic(() => import('deep-chat-react').then((mod) => mod.DeepChat), {
    ssr: false,
  });

  return (
    <>
      <main className={styles.main}>
        <div>
          <h1>Server for custom API</h1>
          <div className={styles.components}>
            {/* you can add the requestBodyMessageLimits property to limit the number of messages included in the request:
              requestBodyMessageLimits={{maxMessages: 1}} - https://deepchat.dev/docs/connect#requestBodyMessageLimits */}

            {/* If you don't want to or can't edit the target service, you can preprocess the outgoing message using
              responseInterceptor and preprocess the incoming message using responseInterceptor:
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
            {/* you can add the requestBodyMessageLimits property to limit the number of messages included in the request:
              requestBodyMessageLimits={{maxMessages: 1}} - https://deepchat.dev/docs/connect#requestBodyMessageLimits */}
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
            <DeepChat
              containerStyle={{borderRadius: '10px'}}
              introMessage="Send a 1024x1024 .png image through NestJS backend to OpenAI and generate its variation."
              request={{url: '/api/openai/image'}}
              images={{files: {acceptedFormats: '.png'}}}
              textInput={{disabled: true, placeholder: {text: 'Send an image!'}}}
            />
          </div>
        </div>
      </main>
    </>
  );
}
