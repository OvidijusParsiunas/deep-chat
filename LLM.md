# Deep Chat - LLM Reference Guide

A framework-agnostic chat component for connecting to AI services. Available as web component (`deep-chat`) and React wrapper (`deep-chat-react`).

**Note:** Examples use vanilla HTML/JS syntax. Convert to your framework: attributes → props/bindings, event listeners → framework handlers, element refs → framework ref patterns.

## Installation

```bash
npm install deep-chat          # Web component
npm install deep-chat-react    # React
```

## Quick Start

```html
<deep-chat connect='{"url": "https://api.example.com/message"}' style="border-radius: 8px"></deep-chat>
```

---

## Connection Methods

### 1. Custom API (`connect`)

Connect to your own server endpoint.

**Properties:**

- `url` (string) - API endpoint
- `method?` (string) - HTTP method (default: "POST")
- `headers?` ({[key: string]: string}) - Request headers
- `stream?` (boolean | object) - Enable streaming responses
- `websocket?` (boolean | string) - Use WebSocket connection
- `handler?` (function) - Custom request handler for full control

**Request Format:**

- Text only: `{messages: MessageContent[]}`
- With files: FormData with `files` array and `message{index}` properties

**Response Format:**

```typescript
{
  text?: string,
  files?: MessageFile[],
  html?: string,
  error?: string,
  overwrite?: boolean
}
```

**Example:**

```html
<deep-chat
  connect='{
    "url": "https://api.example.com/chat",
    "method": "POST",
    "headers": {"Authorization": "Bearer token"},
    "stream": true
  }'
></deep-chat>
```

### 2. Direct Connection (`directConnection`)

Pre-configured connections to 20+ AI services.

**⚠️ Security Warning:** For prototyping only. API keys in client code are visible in the browser. Use `connect` with your server for production.

**Supported Services:**
Claude, OpenAI, Gemini, Groq, HuggingFace, Azure, Cohere, DeepSeek, Kimi, MiniMax, Mistral, Ollama, OpenRouter, OpenWebUI, Perplexity, Qwen, StabilityAI, Together, X, AssemblyAI, BigModel

**Example:**

```html
<deep-chat
  directConnection='{
    "openAI": {
      "key": "sk-...",
      "chat": {"model": "gpt-4", "system_prompt": "You are helpful"}
    }
  }'
></deep-chat>
```

### 3. Web Model (`webModel`)

Run LLMs entirely in the browser.

```html
<deep-chat webModel="true"></deep-chat>
```

---

## Methods

Call methods on the element reference:

| Method                | Signature                                          | Description                          |
| --------------------- | -------------------------------------------------- | ------------------------------------ |
| `getMessages`         | `() => MessageContent[]`                           | Retrieve all chat messages           |
| `clearMessages`       | `(isReset?: boolean) => void`                      | Clear all messages                   |
| `submitUserMessage`   | `(message: UserMessage) => void`                   | Send a user message programmatically |
| `addMessage`          | `(message: Response, isUpdate?: boolean) => void`  | Add a message to chat                |
| `updateMessage`       | `(message: MessageContent, index: number) => void` | Update existing message by index     |
| `scrollToBottom`      | `() => void`                                       | Scroll to latest messages            |
| `focusInput`          | `() => void`                                       | Focus on text input                  |
| `setPlaceholderText`  | `(text: string) => void`                           | Update input placeholder             |
| `disableSubmitButton` | `(override?: boolean) => void`                     | Disable/enable submit button         |
| `refreshMessages`     | `() => void`                                       | Re-highlight code blocks             |

**Example:**

```javascript
chatElementRef.getMessages();
chatElementRef.submitUserMessage({text: 'Hello'});
chatElementRef.addMessage({text: 'Response', role: 'ai'});
```

---

## Events

Attach as properties or event listeners:

| Event               | Function Signature                                              | Trigger               |
| ------------------- | --------------------------------------------------------------- | --------------------- |
| `onMessage`         | `(body: {message: MessageContent, isHistory: boolean}) => void` | Message sent/received |
| `onClearMessages`   | `() => void`                                                    | Messages cleared      |
| `onComponentRender` | `(chatElementRef: DeepChat) => void`                            | Component rendered    |
| `onInput`           | `(body: {content: {text?, files?}, isUser: boolean}) => void`   | Input changed         |
| `onError`           | `(error: string) => void`                                       | Error displayed       |

**Example:**

```javascript
chatElementRef.onMessage = (body) => {
  console.log(body.message);
};

// Or as event listener:
chatElementRef.addEventListener('new-message', (event) => {
  console.log(event.detail);
});
```

---

## Interceptors

Modify requests/responses or load history asynchronously:

| Interceptor           | Signature                                                          | Description                                  |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| `requestInterceptor`  | `(details: {body, headers}) => details \| {error}`                 | Modify outgoing requests (sync/async)        |
| `responseInterceptor` | `(response: any) => Response`                                      | Modify incoming responses (sync/async)       |
| `loadHistory`         | `(index: number) => MessageContent[] \| Promise<MessageContent[]>` | Load messages asynchronously with pagination |
| `validateInput`       | `(text?: string, files?: File[]) => boolean`                       | Validate user input before sending           |

**Example:**

```javascript
chatElementRef.requestInterceptor = (details) => {
  details.headers.Authorization = 'Bearer token';
  return details;
};

chatElementRef.loadHistory = async (index) => {
  const messages = await fetch(`/api/history?page=${index}`);
  return messages.json();
};
```

---

## Messages

### Properties

| Property         | Type                                                         | Description                                   |
| ---------------- | ------------------------------------------------------------ | --------------------------------------------- |
| `history`        | `MessageContent[]`                                           | Pre-populate chat with messages               |
| `browserStorage` | `boolean \| {key?, maxMessages?, textInput?, scrollHeight?}` | Auto-save messages to localStorage (max 1000) |
| `introMessage`   | `{text?, html?} \| Array`                                    | Initial AI message (not in history)           |

### Message Structure

```typescript
MessageContent {
  role?: "ai" | "user" | string,  // Default: "ai"
  text?: string,                  // Supports Markdown & code blocks
  files?: MessageFile[],
  html?: string,                  // Custom HTML elements
  custom?: any
}

MessageFile {
  name?: string,
  src?: string,                   // URL or base64
  type?: "image" | "audio" | "any",
  ref?: File                      // Original file (in onMessage events)
}

UserMessage {
  text?: string,
  files?: File[] | FileList,
  custom?: any
}
```

**Example:**

```html
<deep-chat
  history='[
    {"text": "Hello", "role": "user"},
    {"text": "Hi there!", "role": "ai"},
    {"files": [{"src": "image.jpg", "type": "image"}], "role": "user"}
  ]'
  browserStorage='{"maxMessages": 500}'
  introMessage='{"text": "How can I help you?"}'
></deep-chat>
```

---

## File Handling

Enable file upload buttons and drag-and-drop:

| Property      | Type                                      | Description                                            |
| ------------- | ----------------------------------------- | ------------------------------------------------------ |
| `images`      | `boolean \| FilesServiceConfig`           | Image upload button (.png, .jpg default)               |
| `gifs`        | `boolean \| FilesServiceConfig`           | GIF upload button                                      |
| `audio`       | `boolean \| FilesServiceConfig`           | Audio upload button (.mp3, .wav, etc.)                 |
| `documents`   | `boolean \| FilesServiceConfig`           | Document upload button                                 |
| `mixedFiles`  | `boolean \| FilesServiceConfig`           | Any file type upload                                   |
| `camera`      | `boolean \| CameraFilesServiceConfig`     | Web camera capture                                     |
| `microphone`  | `boolean \| MicrophoneFilesServiceConfig` | Audio recording                                        |
| `dragAndDrop` | `boolean \| CustomStyle`                  | Drag-and-drop styling (auto-enabled with file buttons) |

**FilesServiceConfig:**

```typescript
{
  connect?: Connect,              // Override connection for files
  files?: {
    maxNumberOfFiles?: number,
    acceptedFormats?: string,     // e.g., ".jpg,.png"
    infoModal?: {textMarkDown: string, openModalOnce?: boolean}
  },
  button?: Button
}
```

**Example:**

```html
<deep-chat
  images="true"
  audio='{"files": {"acceptedFormats": ".mp3,.wav", "maxNumberOfFiles": 2}}'
  dragAndDrop='{"backgroundColor": "#f0f0f0"}'
></deep-chat>
```

---

## Speech

### Text-to-Speech

Automatically read incoming messages aloud.

```typescript
textToSpeech: boolean |
  {
    voiceName: string, // OS-dependent voices
    lang: string, // e.g., "en-US"
    pitch: number,
    rate: number,
    volume: number,
    audio: {autoPlay: boolean, displayAudio: boolean, displayText: boolean},
  };
```

**Example:**

```html
<deep-chat textToSpeech='{"volume": 0.9, "lang": "en-US"}'></deep-chat>
```

### Speech-to-Text

Transcribe voice into text using Web Speech API or Azure.

```typescript
speechToText: boolean |
  {
    webSpeech: boolean | {language: string},
    azure: {region, subscriptionKey, token, retrieveToken, language},
    commands: {stop, pause, resume, submit, removeAllText, commandMode},
    button: MicrophoneStyles,
    stopAfterSubmit: boolean, // Default: true
    submitAfterSilence: number, // Auto-submit after silence (ms)
  };
```

**Example:**

```html
<deep-chat speechToText='{"webSpeech": true, "commands": {"submit": "send"}, "submitAfterSilence": 3000}'></deep-chat>
```

---

## Styling

### Container Styles

| Property                   | Type          | Description               |
| -------------------------- | ------------- | ------------------------- |
| `style` / `chatStyle`      | `CustomStyle` | Container CSS styling     |
| `attachmentContainerStyle` | `CustomStyle` | File attachment container |
| `inputAreaStyle`           | `CustomStyle` | Input area at bottom      |

**Example:**

```html
<deep-chat
  style="border-radius: 8px; background-color: #f7f7f7"
  inputAreaStyle='{"backgroundColor": "#ebf5ff"}'
></deep-chat>
```

### Message Styles

```typescript
messageStyles: {
  default?: {
    shared?: {bubble?: CustomStyle, outerContainer?, innerContainer?},
    user?: {...},
    ai?: {...}
  },
  user?: MessageRoleStyles,
  ai?: MessageRoleStyles,
  [customRole]?: MessageRoleStyles  // Custom roles (e.g., "bob")
}
```

**Example:**

```html
<deep-chat
  messageStyles='{
    "default": {"shared": {"bubble": {"maxWidth": "300px", "borderRadius": "10px"}}},
    "user": {"bubble": {"backgroundColor": "#e3f2fd"}},
    "ai": {"bubble": {"backgroundColor": "#f5f5f5"}}
  }'
></deep-chat>
```

### Button Styles

```typescript
customButtons: [{
  position?: "inside-start" | "inside-end" | "outside-start" | "outside-end" | "dropup-menu",
  styles?: {default?, hover?, click?, disabled?, loading?},
  svg?: {content: string, styles?: {...}},
  custom?: string,  // Custom HTML
  text?: string,
  tooltip?: {text: string, style?: CustomStyle},
  dropupItems?: Array<{text, click: () => void}>
}]
```

### Text Input

```typescript
textInput: {
  styles?: {text?, container?, focus?},
  placeholder?: {text?: string, style?: CustomStyle},
  characterLimit?: number,
  disabled?: boolean
}
```

**Example:**

```html
<deep-chat
  textInput='{
    "styles": {"container": {"backgroundColor": "#f5f9ff"}, "focus": {"border": "2px solid #a2a2ff"}},
    "placeholder": {"text": "Type here..."},
    "characterLimit": 500
  }'
></deep-chat>
```

---

## Additional Features

### Request Body Limits

```typescript
requestBodyLimits: {
  maxMessages?: number,              // Max messages in request (0 = all)
  totalMessagesMaxCharLength?: number
}
```

### Avatars & Names

```html
<deep-chat avatars="true" names='{"user": {"text": "You"}, "ai": {"text": "Assistant"}}'></deep-chat>
```

### Error Messages

```typescript
errorMessages: {
  displayServiceErrorMessages?: boolean,
  overrides?: {default?: string, service?: string, speechToText?: string}
}
```

### Demo Mode

Test without connecting to a service.

```typescript
demo: boolean |
  {
    response: Function | Response,
    displayErrors: boolean,
    displayLoading: boolean,
  };
```

### Other

```html
<deep-chat scrollButton="true" hiddenMessages="true" maxVisibleMessages="1000"></deep-chat>
```

---

## Type Reference

```typescript
// Message Types
MessageContent {
  role?: "ai" | "user" | string
  text?: string
  files?: MessageFile[]
  html?: string
  custom?: any
}

MessageFile {
  name?: string
  src?: string
  type?: "image" | "audio" | "any"
  ref?: File
}

Response = MessageContent & {
  error?: string
  overwrite?: boolean
}

// Connection Types
Connect {
  url?: string
  method?: string
  headers?: {[key: string]: string}
  additionalBodyProps?: {[key: string]: any}
  credentials?: string
  websocket?: boolean | string | string[]
  stream?: boolean | {simulation?, readable?, partialRender?}
  handler?: (body: any, signals: Signals) => void
}

Signals {
  onResponse: (response: Response) => Promise<void>
  onOpen: () => void
  onClose: () => void
  stopClicked: {listener: () => void}
  newUserMessage: {listener: (body: any) => void}
}

// Style Types
CustomStyle = CSSStyleDeclaration  // CSS properties as object

StatefulStyles {
  default?: CustomStyle
  hover?: CustomStyle
  click?: CustomStyle
}
```

---

## Framework Usage Example

```javascript
// Vanilla JavaScript
const chatElement = document.querySelector('deep-chat');
chatElement.directConnection = {openAI: {key: 'sk-...'}};
chatElement.onMessage = (msg) => console.log(msg);
```

---

**Documentation Version:** 2.3.0
**Component Type:** Web Component (Shadow DOM)
**Official Docs:** https://deepchat.dev/docs
