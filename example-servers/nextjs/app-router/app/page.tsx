/* eslint-disable @next/next/no-img-element */
// Define this when using the App router API
'use client';

// !!Useful links at the bottom!!
// import {DeepChat as DeepChatCore} from 'deep-chat'; <- type
import {RequestDetails} from 'deep-chat/dist/types/interceptors';
import styles from './style.module.css';
import dynamic from 'next/dynamic';

// Info to get a reference for the component:
// https://github.com/OvidijusParsiunas/deep-chat/issues/59#issuecomment-1839483469

// Info to add types to a component reference:
// https://github.com/OvidijusParsiunas/deep-chat/issues/59#issuecomment-1839487740

export default function Home() {
  // need to import the component dynamically as it uses the 'window' property
  const DeepChat = dynamic(() => import('deep-chat-react').then((mod) => mod.DeepChat), {
    ssr: false,
  });

  return (
    <>
      <main className={styles.main}>
        <h1 id={styles.pageTitle}>
          Deep Chat test ground for{' '}
          <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers/nextjs">NextJs</a>
        </h1>
        <h1>Server for a custom API</h1>
        <div className={styles.components}>
          <div className={styles.diagonalLine} style={{background: '#e8f5ff'}}></div>
          {/* by setting maxMessages requestBodyLimits to 0 or lower - each request will send full chat history:
            https://deepchat.dev/docs/connect/#requestBodyLimits */}
          {/* If you don't want to or can't edit the target service, you can process the outgoing message using
            responseInterceptor and the incoming message using responseInterceptor:
            https://deepchat.dev/docs/interceptors */}
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{text: 'Send a chat message to an example server.'}}
            connect={{url: '/api/custom/chat'}}
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
            style={{borderRadius: '10px'}}
            introMessage={{text: 'Send a streamed chat message to an example server.'}}
            connect={{url: '/api/custom/chat-stream', stream: true}}
          />
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{text: 'Send files to an example server.'}}
            connect={{url: '/api/custom/files'}}
            audio={true}
            images={true}
            gifs={true}
            camera={true}
            microphone={true}
            mixedFiles={true}
            textInput={{placeholder: {text: 'Send a file!'}}}
            validateInput={(_?: string, files?: File[]) => {
              return !!files && files.length > 0;
            }}
          />
        </div>
        <h1 className={styles.serverTitle}>Server for OpenAI</h1>
        <a href="https://openai.com/blog/openai-api" target="_blank" rel="noreferrer">
          <img
            className={styles.serverTitleIcon}
            src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/openAILogo.png"
            style={{width: 26, marginBottom: '-1px'}}
            alt={'Title icon'}
          />
        </a>
        <h3>Make sure to set the OPENAI_API_KEY environment variable in your server</h3>
        <div className={styles.components}>
          <div className={styles.diagonalLine} style={{background: '#f2f2f2'}}></div>
          {/* additionalBodyProps is used to set other properties that will be sent to the server along with the message:
            https://deepchat.dev/docs/connect#connect */}
          {/* by setting maxMessages requestBodyLimits to 0 or lower - each request will send full chat history:
            https://deepchat.dev/docs/connect/#requestBodyLimits */}
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{text: 'Send a chat message through an example server to OpenAI.'}}
            connect={{url: '/api/openai/chat', additionalBodyProps: {model: 'gpt-4o'}}}
            requestBodyLimits={{maxMessages: -1}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{text: 'Send a streamed chat message through an example server to OpenAI.'}}
            connect={{url: '/api/openai/chat-stream', stream: true, additionalBodyProps: {model: 'gpt-4o'}}}
            requestBodyLimits={{maxMessages: -1}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
          {/* If not using the camera, you can use an example image here:
            https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png */}
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{
              text: 'Send a 1024x1024 .png image through an example server to OpenAI, which will generate its variation.',
            }}
            connect={{url: '/api/openai/image'}}
            camera={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
            images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
            textInput={{disabled: true, placeholder: {text: 'Send an image!'}}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
        </div>

        <h1 className={styles.serverTitle}>Server for Hugging Face</h1>
        <a href="https://huggingface.co/docs/api-inference/index" target="_blank" rel="noreferrer">
          <img
            className={styles.serverTitleIcon}
            src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/huggingFaceLogo.png"
            style={{width: 36, marginBottom: '-6px', marginLeft: '7px'}}
            alt={'Title icon'}
          />
        </a>
        <h3>Make sure to set the HUGGING_FACE_API_KEY environment variable in your server</h3>
        <div className={styles.components}>
          <div className={styles.diagonalLine} style={{background: '#fffdd9'}}></div>
          {/* by setting maxMessages requestBodyLimits to 0 or lower - each request will send full chat history:
            https://deepchat.dev/docs/connect/#requestBodyLimits */}
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{text: 'Send a conversation message through an example server to Hugging Face.'}}
            requestBodyLimits={{maxMessages: -1}}
            connect={{url: '/api/huggingface/conversation'}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
          {/* If not using the camera, you can use an example image here:
            https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png */}
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{
              text: 'Send an image through an example server to Hugging Face and retrieve its classification.',
            }}
            connect={{url: '/api/huggingface/image'}}
            camera={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
            images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
            textInput={{disabled: true, placeholder: {text: 'Send an image!'}}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
          {/* If not using the microphone, you can send an example audio file here:
            https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-audio.m4a */}
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{
              text: 'Send an audio file through an example server to Hugging Face and recieve its transcript.',
            }}
            connect={{url: '/api/huggingface/speech'}}
            audio={{files: {maxNumberOfFiles: 1}}}
            microphone={{files: {maxNumberOfFiles: 1}}}
            textInput={{disabled: true, placeholder: {text: 'Send an audio file!'}}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
        </div>

        <h1 className={styles.serverTitle}>Server for Stability AI</h1>
        <a href="https://platform.stability.ai/" target="_blank" rel="noreferrer">
          <img
            className="server-title-icon"
            src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/stabilityAILogo.png"
            style={{width: 34, marginBottom: '-6px', marginLeft: '10px'}}
            alt={'Title icon'}
          />
        </a>
        <h3>Make sure to set the STABILITY_API_KEY environment variable in your server</h3>
        <div className={styles.components}>
          <div className={styles.diagonalLine} style={{background: '#f7efff'}}></div>
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{text: 'Send a prompt through an example server to Stability AI to generate an image.'}}
            connect={{url: '/api/stabilityai/text-to-image'}}
            textInput={{placeholder: {text: 'Describe an image'}}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
          {/* If not using the camera, you can use an example image here:
              https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png */}
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{
              text: 'Send an image along with a description through an example server to Stability AI in order to generate a new one with the described changes.',
            }}
            connect={{url: '/api/stabilityai/image-to-image'}}
            camera={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
            images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
            textInput={{placeholder: {text: 'Describe the desired changes'}}}
            errorMessages={{displayServiceErrorMessages: true}}
            validateInput={(text?: string, files?: File[]) => {
              return !!text && text?.trim() !== '' && !!files && files.length > 0;
            }}
          />
          {/* If not using the camera, you can use an example image here:
              https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png */}
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{
              text: 'Send an image through an example server to Stability AI in order to generate a new one with a higher resolution.',
            }}
            connect={{url: '/api/stabilityai/image-upscale'}}
            camera={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
            images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
            textInput={{disabled: true, placeholder: {text: 'Send an image'}}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
        </div>

        <h1 className={styles.serverTitle}>Server for Cohere</h1>
        <a href="https://docs.cohere.com/docs" target="_blank" rel="noreferrer">
          <img
            className={styles.serverTitleIcon}
            src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/cohereLogo.png"
            style={{width: 37, marginBottom: '-8px', marginLeft: '4px'}}
            alt={'Title icon'}
          />
        </a>
        <h3>Make sure to set the COHERE_API_KEY environment variable in your server</h3>
        <div className={styles.components}>
          <div className={styles.diagonalLine} style={{background: '#fff2f7'}}></div>
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{
              text: 'Send a chat message through an example server to Cohere. You may need to apply for Coral access before using this.',
            }}
            connect={{url: '/api/cohere/chat'}}
            requestBodyLimits={{maxMessages: -1}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{
              text: 'Send start text through an example server to Cohere and receive its genereated completion. E.g. "Please explain to me how LLMs work"',
            }}
            connect={{url: '/api/cohere/generate'}}
            textInput={{placeholder: {text: 'Once upon a time...'}}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
          <DeepChat
            style={{borderRadius: '10px'}}
            introMessage={{text: 'Send text through an example server to Cohere and receive its summary.'}}
            connect={{url: '/api/cohere/summarize'}}
            textInput={{placeholder: {text: 'Insert text to summarize'}}}
            errorMessages={{displayServiceErrorMessages: true}}
          />
        </div>
      </main>
    </>
  );
}
