<br />

![alt text](./assets/readme/title.png)

<b>Deep Chat</b> is a fully customizable chat based web component built with a focus on powering next generation AI services. Whether you want to create a chatbot that leverages an already existing API such as ChatGPT or you want to connect to your own custom service, this component can be configured to do it all! Explore [deepchat.dev](https://activetable.io/) to view all of the available features, how to use them, examples and more!

### :rocket: Main Features

- Connect to any API
- Avatars
- Names
- Send/Receive files
- Capture photos via webcam
- Record audio via microphone
- Speech To Text for message input
- Text To Speech to hear message responses
- Support for MarkDown to structure text and render code
- Introduction panel to help describe the chat to your users
- Modals triggered via buttons to help inform their functionality
- Preconfigured options to connect to APIs from OpenAI, HuggingFace, Azure and more
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

![alt text](./assets/readme/title.png)

#### Existing APIs

To connect to an existing API checkout the [Existing Service](HERE) section in the documentation to view the available preset configurations. As an example, if you want to the connect to OpenAI chat API, you can use the following:

```
<deep-chat directConnection='{"openAI":true}'/>
```

You can additionally preload it with your own key:

```
<deep-chat directConnection='{"openAI":{"key": "key-here"}}'/>
```

The exact syntax for the above examples will vary depending on the framework of your choice ([see here](https://activetable.io/examples/frameworks)).

Please note that the examples above should be used for prototyping purposes and not in a live environment as they will expose your API key in the browser. Before going live, please use the [`request`](HERE) property to instead direct all network requests to your trusted server. (See below)

#### Custom APIs

To connect to a custom API such as your own check out the [Service](HERE) section in the documentation and view full project examples [here](HERE).

The core property that supports this feature is [`request`](HERE). For example, you can use it like this:

```
<deep-chat request='{"url": "https://customdomain.com"}'/>
```

To use an existing API's configuration, such as OpenAI chat, you can use the following configuration:

```
<deep-chat directConnection='{"openAI":true}' request='{"url": "https://customdomain.com"}'/>
```

The exact syntax for the above examples will vary depending on the framework of your choice ([see here](https://activetable.io/examples/frameworks)).

<!-- Please note that depending on the configuration used, your service will need to support the incoming body and response formats for successful transactions. (A quick workaround alternative for this is to use the [`requestInterceptor`](HERE) and [`responseInterceptor`](HERE) properties which allow the augmentation of incoming and outgoing messages). This is explained in more detail in the [Service](HERE) documentation. -->

### :camera: :microphone: Camera and Microphone

Deep Chat can be used to create new files from within the component. You can use the camera modal to capture photos via the webcam or record audio via the microphone.

![alt text](./assets/readme/title.png)

You can enable this via the use of the [_camera_](HERE) and [_microphone_](HERE) properties. E.g:

```
<deep-chat camera="true" microphone="true" ...other properties />
```

The exact syntax for this examples will vary depending on the framework of your choice ([see here](https://activetable.io/examples/frameworks)).

### :microphone: :sound: Speech

You can use Speech To Text to construct your messages via voice. This has been integrated into the component via the use of the [speech to element] library that facilitates the use of [Web Speech](HERE) (default) and [Azure](JERE) APIs.

You can also use Text To Speech to read out the text response messages via [Web Speech](HERE).

Please read how to enable this functionality [here](HERE).

![alt text](./assets/readme/title.png)

## :heart: Contributions

Open source is built by the community for the community. All contributions to this project are welcome!
<br> Additionally, if you have any suggestions for enhancements, ideas on how to take the project further or have discovered a bug, do not hesitate to create a new issue ticket and we will look into it as soon as possible!
