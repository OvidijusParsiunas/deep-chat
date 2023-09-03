<script>
  /**
   * @type {import('deep-chat/dist/types/interceptors').RequestDetails}
  */
  let RequestDetails;

	import { onMount } from 'svelte';
	import './styles.css';

	onMount(async () => {
		await import("deep-chat");
	});

	const introMessage = "I am your personal assistant!";
  const initialMessages = [
    { role: "user", text: "Hey, how are you today?" },
    { role: "ai", text: "I am doing very well!" }
  ];
  const chatStyle = {borderRadius: '10px'};
</script>

<!-- WORK - use https://developer.mozilla.org/en-US/docs/Web/CSS/--* instead of style -->
<main class='app'>
  <h1 id="page-title">
    Deep Chat test ground for{' '}
    <!-- WORK - update -->
    <a href="https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers/nextjs">SvelteKit</a>
  </h1>
  <h1>Server for a custom API</h1>
  <div class="components">
    <div class="diagonal-line" style="background: #e8f5ff"></div>
     <!-- by setting maxMessages requestBodyLimits to 0 or lower - each request will send full chat history:
      https://deepchat.dev/docs/connect/#requestBodyLimits -->
    <!-- If you don't want to or can't edit the target service, you can process the outgoing message using
      responseInterceptor and the incoming message using responseInterceptor:
      https://deepchat.dev/docs/interceptors -->
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send a chat message to an example server. "
      request={{url: '/api/custom/chat'}}
      requestBodyLimits={{maxMessages: -1}}
      requestInterceptor={(/** @type {RequestDetails} */ details) => {
        console.log(details);
        return details;
      }}
      responseInterceptor={(/** @type {any} */ response) => {
        console.log(response);
        return response;
      }}
    />
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send a streamed chat message to an example server."
      request={{url: '/api/custom/chat-stream'}}
      stream={true}
    />
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send files to an example server."
      request={{url: '/api/custom/files'}}
      audio={true}
      images={true}
      gifs={true}
      camera={true}
      microphone={true}
      mixedFiles={true}
      textInput={{placeholder: {text: 'Send a file!'}}}
      validateMessageBeforeSending={(/** @type {any} */ _, /** @type {string | any[]} */ files) => {
        return files && files.length > 0;
      }}
    />
  </div>
  <h1 class="server-title">Server for OpenAI</h1>
    <a href="https://openai.com/blog/openai-api" target="_blank" rel="noreferrer">
    <img
    class="server-title-icon"
    src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/openAILogo.png"
      style="width: 26px; marginBottom: -1px"
      alt={'Title icon'}
    />
  </a>
  <h3>Make sure to set the OPENAI_API_KEY environment variable in your server</h3>
  <div class="components">
    <div class="diagonal-line" style="background: #f2f2f2"></div>
    <!-- by setting maxMessages requestBodyLimits to 0 or lower - each request will send full chat history:
      https://deepchat.dev/docs/connect/#requestBodyLimits -->
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send a chat message through an example server to OpenAI."
      request={{url: '/api/openai/chat', additionalBodyProps: {model: 'gpt-3.5-turbo'}}}
      requestBodyLimits={{maxMessages: -1}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send a streamed chat message through an example server to OpenAI."
      request={{url: '/api/openai/chat-stream', additionalBodyProps: {model: 'gpt-3.5-turbo'}}}
      stream={true}
      requestBodyLimits={{maxMessages: -1}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
    <!-- If not using the camera, you can use an example image here:
      https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png -->
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send a 1024x1024 .png image through an example server to OpenAI, which will generate its variation."
      request={{url: '/api/openai/image'}}
      camera={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
      images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
      textInput={{disabled: true, placeholder: {text: 'Send an image!'}}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
  </div>

  <h1 class="server-title">Server for Hugging Face</h1>
  <a href="https://learn.microsoft.com/en-gb/azure/cognitive-services/" target="_blank" rel="noreferrer">
    <img
    class="server-title-icon"
    src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/huggingFaceLogo.png"
      style="width: 36px; margin-bottom: -6px; margin-left: 7px"
      alt={'Title icon'}
    />
  </a>
  <h3>Make sure to set the HUGGING_FACE_API_KEY environment variable in your server</h3>
  <div class="components">
    <div class="diagonal-line" style="background: #fffdd9"></div>
    <!-- by setting maxMessages requestBodyLimits to 0 or lower - each request will send full chat history:
      https://deepchat.dev/docs/connect/#requestBodyLimits -->
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send a conversation message through an example server to Hugging Face."
      requestBodyLimits={{maxMessages: -1}}
      request={{url: '/api/huggingface/conversation'}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
    <!-- If not using the camera, you can use an example image here:
      https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png -->
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send an image through an example server to Hugging Face and retrieve its classification."
      request={{url: '/api/huggingface/image'}}
      camera={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
      images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
      textInput={{disabled: true, placeholder: {text: 'Send an image!'}}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
    <!-- If not using the microphone, you can send an example audio file here:
      https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-audio.m4a -->
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send an audio file through an example server to Hugging Face and recieve its transcript."
      request={{url: '/api/huggingface/speech'}}
      audio={{files: {maxNumberOfFiles: 1}}}
      microphone={{files: {maxNumberOfFiles: 1}}}
      textInput={{disabled: true, placeholder: {text: 'Send an audio file!'}}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
  </div>

  <h1 class="server-title">Server for Stability AI</h1>
  <a href="https://platform.stability.ai/" target="_blank" rel="noreferrer">
    <img
      class="server-title-icon"
      src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/stabilityAILogo.png"
      style="width: 34px; margin-bottom: -6px; margin-left: 10px"
      alt={'Title icon'}
    />
  </a>
  <h3>Make sure to set the STABILITY_API_KEY environment variable in your server</h3>
  <div class="components">
    <div class="diagonal-line" style="background: #f7efff"></div>
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send a prompt through an example server to Stability AI to generate an image."
      request={{url: '/api/stabilityai/text-to-image'}}
      textInput={{placeholder: {text: 'Describe an image'}}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
    <!-- If not using the camera, you can use an example image here:
        https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png -->
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send an image along with a description through an example server to Stability AI in order to generate a new one with the described changes."
      request={{url: '/api/stabilityai/image-to-image'}}
      camera={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
      images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
      textInput={{placeholder: {text: 'Describe the desired changes'}}}
      errorMessages={{displayServiceErrorMessages: true}}
      validateMessageBeforeSending={(/** @type {string} */ text, /** @type {File[]} */ files) => {
        return !!text && text?.trim() !== '' && files && files.length > 0;
      }}
    />
    <!-- If not using the camera, you can use an example image here:
        https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png -->
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send an image through an example server to Stability AI in order to generate a new one with a higher resolution."
      request={{url: '/api/stabilityai/image-upscale'}}
      camera={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
      images={{files: {maxNumberOfFiles: 1, acceptedFormats: '.png'}}}
      textInput={{disabled: true, placeholder: {text: 'Send an image'}}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
  </div>

  <h1 class="server-title">Server for Cohere</h1>
  <a href="https://docs.cohere.com/docs" target="_blank" rel="noreferrer">
    <img
      class="server-title-icon"
      src="https://raw.githubusercontent.com/OvidijusParsiunas/deep-chat/HEAD/website/static/img/cohereLogo.png"
      style="width: 37px; margin-bottom: -8px; margin-left: 4px"
      alt={'Title icon'}
    />
  </a>
  <h3>Make sure to set the COHERE_API_KEY environment variable in your server</h3>
      <div class="components">
        <div class="diagonal-line" style="background: #fff2f7"></div>
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send a chat message through an example server to Cohere. You may need to apply for Coral access before using this."
      request={{url: '/api/cohere/chat'}}
      requestBodyLimits={{maxMessages: -1}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
    <deep-chat
      containerStyle={chatStyle}
      introMessage='Send start text through an example server to Cohere and receive its genereated completion. E.g. "Please explain to me how LLMs work"'
      request={{url: '/api/cohere/generate'}}
      textInput={{placeholder: {text: 'Once upon a time...'}}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
    <deep-chat
      containerStyle={chatStyle}
      introMessage="Send text through an example server to Cohere and receive its summary."
      request={{url: '/api/cohere/summarize'}}
      textInput={{placeholder: {text: 'Insert text to summarize'}}}
      errorMessages={{displayServiceErrorMessages: true}}
    />
  </div>
</main>
