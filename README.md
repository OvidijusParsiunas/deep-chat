<br />

![alt text](./assets/readme/screenshot-23.png)

<b>Deep Chat</b> is a fully customizable chat based web component built with a focus on powering next generation AI services. Whether you want to create a chatbot that leverages popular APIs such as ChatGPT or you want to connect to your own custom service, this component can do it all! Explore [deepchat.dev](https://deepchat.dev/) to view all of the available features, how to use them, examples and more!

### :rocket: Main Features

- Connect to any API
- Avatars
- Names
- Send/Receive files
- Capture photos via webcam
- Record audio via microphone
- Speech To Text for message input
- Text To Speech to hear message responses
- Support for MarkDown to help structure text and render code
- Introduction panel and dynamic modals to help describe functionality for your users
- Connect to popular AI APIs such as OpenAI, HuggingFace, Azure directly from the browser
- Support for all major ui frameworks/libraries
- Everything is customizable!

### :computer: Getting started

```
npm install deep-chat
```

If using React, install the following instead:

```
npm install deep-chat-react
```

To test the component - simply add the following to your markup:

```
<deep-chat directConnection='{"demo":true}'/>
```

The exact syntax for the above example will vary depending on the framework of your choice ([see here](https://activetable.io/examples/frameworks)).

### :zap: Connect

![alt text](./assets/readme/connect-24.png)

Connecting to a service is simple, all you need to do is define its API details using the [`request`](https://deepchat.dev/docs/connect#request) property:

```
<deep-chat request='{"url":"https://service.com/chat"}'/>
```

The service will need to be able to handle request and response formats used in Deep Chat. Please read the [Connect](https://deepchat.dev/docs/connect) section in documentation and check out full [project examples](https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers).

Alternatively, if you want to connect without changing the target service, use the [`requestInterceptor`](https://deepchat.dev/docs/interceptors#requestInterceptor) and [`responseInterceptor`](https://deepchat.dev/docs/interceptors#responseInterceptor) properties to augment the incoming and outgoing request details.

### :electric_plug: Direct connection

![alt text](./assets/readme/direct-connect-19.png)

Connect to popular AI APIs directly from the browser via the use of the [`directConnection`](https://deepchat.dev/docs/directConnection/#directConnection) property:

```
<deep-chat directConnection='{"openAI":true}'/>

<deep-chat directConnection='{"openAI":{"key": "optional-key-here"}}'/>
```

Please note that this approach should be used for local/prototyping/demo purposes ONLY as it exposes the API Key to the browser. When ready to go live, please switch to using the [`request`](https://deepchat.dev/docs/connect#request) property described above with a combination of a [proxy service](https://github.com/OvidijusParsiunas/deep-chat/tree/main/example-servers).

Currently supported direct API connections:
[OpenAI](https://openai.com/blog/openai-api), [HuggingFace](https://learn.microsoft.com/en-gb/azure/cognitive-services/), [Cohere](https://docs.cohere.com/docs), [Azure](https://learn.microsoft.com/en-gb/azure/cognitive-services/), [AssembleAI](https://www.assemblyai.com/)

### :camera: :microphone: Camera and Microphone

![alt text](./assets/readme/capture-14.png)

Use Deep Chat to capture photos with your webcam and record audio with the microphone. You can enable this using the [`camera`](https://deepchat.dev/docs/files#camera) and [`microphone`](https://deepchat.dev/docs/files#microphone) properties:

```
<deep-chat camera="true" microphone="true" ...other properties />
```

### :microphone: :sound: Speech

![alt text](./assets/readme/title.png)

Input text with your voice using Speech To Text capabilities and have the responses read out to you with Text To Speech. You can enable this functionality via the [`speechToText`](HERE) and [`textToSpeech`](HERE) properties.

```
<deep-chat speechToText="true" microphone="textToSpeech" ...other properties />
```

## :heart: Contributions

Open source is built by the community for the community. All contributions to this project are welcome!<br>
Additionally, if you have any suggestions for enhancements, ideas on how to take the project further or have discovered a bug, do not hesitate to create a new issue ticket and we will look into it as soon as possible!
