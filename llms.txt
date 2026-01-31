# Deep Chat - LLM Reference

Web component (`deep-chat`) and React wrapper (`deep-chat-react`) for AI chat interfaces.

## Installation
```bash
npm install deep-chat
npm install deep-chat-react
```

## Connection

### `connect`
```typescript
connect: {
  url?: string
  method?: string  // default: "POST"
  headers?: {[key: string]: string}
  additionalBodyProps?: {[key: string]: any}
  credentials?: string  // default: "same-origin"
  websocket?: boolean | string | string[]
  stream?: true | {simulation?: boolean | number | string, readable?: boolean, partialRender?: boolean}  // simulation: number=ms delay, string=end-phrase for websockets
  handler?: (body: {messages: MessageContent[]}, signals: Signals) => void  // error handling must be done within handler
}

Signals: {
  onResponse: (response: Response) => Promise<void>
  onOpen: () => void
  onClose: () => void
  stopClicked: {listener: () => void}
  newUserMessage: {listener: (body: any) => void}
}
```

Request body: `{messages: MessageContent[]}` for text-only, or FormData with `files` array and `message{index}` properties for file uploads. Parse FormData on server with `formData.get("message1")`.

### `directConnection`
Prototyping only - API keys in client code are visible in browser. Use `connect` with server proxy for production.

Supports: AssemblyAI, Azure, BigModel, Claude, Cohere, DeepSeek, Dify, Gemini, Groq, HuggingFace, Kimi, MiniMax, Mistral, Ollama, OpenAI, OpenRouter, OpenWebUI, Perplexity, Qwen, StabilityAI, Together, X

```html
<deep-chat directConnection='{"openAI": {"key": "sk-...", "chat": {"model": "gpt-4"}}}'></deep-chat>
```

### `webModel`
```html
<deep-chat webModel="true"></deep-chat>
```

### `requestBodyLimits`
```typescript
requestBodyLimits: {maxMessages?: number, totalMessagesMaxCharLength?: number}
```
`maxMessages` behavior: `undefined` = only input text/files sent (no history); `0` or below = all messages; `1` = only new user message; `2` = new message + one previous; etc. `introMessage` is never included.

## Methods
```typescript
getMessages(): MessageContent[]
clearMessages(isReset?: boolean): void
submitUserMessage(message: {text?: string, files?: File[] | FileList}): void
addMessage(message: Response, isUpdate?: boolean): void
updateMessage(message: MessageContent, index: number): void
scrollToBottom(): void
focusInput(): void
setPlaceholderText(text: string): void
disableSubmitButton(override?: boolean): void
refreshMessages(): void
```

## Events
```typescript
onMessage: (body: {message: MessageContent, isHistory: boolean}) => void
onClearMessages: () => void
onComponentRender: (chatElementRef: DeepChat) => void
onInput: (body: {content: {text?: string, files?: File[]}, isUser: boolean}) => void
onError: (error: string) => void
```

## Interceptors
```typescript
requestInterceptor: (details: {body: any, headers: {[key: string]: string}}) => details | {error: string}
responseInterceptor: (response: any) => Response
loadHistory: (index: number) => MessageContent[] | Promise<MessageContent[]>
validateInput: (text?: string, files?: File[]) => boolean
```

## Messages

```typescript
history: MessageContent[]

introMessage: {text?: string, html?: string} | Array

browserStorage: true | {
  key?: string  // default: "deep-chat-storage"
  maxMessages?: number  // default: 1000
  textInput?: boolean
  scrollHeight?: boolean
  clear?: () => void  // auto-assigned, requires object form (not boolean) to access
}

displayLoadingBubble: boolean | {toggle: (config?: {style?: LoadingStyles, role?: string}) => void}

scrollButton: true | {styles?: StatefulStyles, smoothScroll?: boolean, scrollDelta?: number, content?: string}

hiddenMessages: true | {
  styles?: StatefulStyles
  onUpdate?: (content: string, number: number) => string
  clickScroll?: "first" | "last"
  smoothScroll?: boolean
}

errorMessages: {
  displayServiceErrorMessages?: boolean
  overrides?: {default?: string, service?: string, speechToText?: string}
}

maxVisibleMessages: number  // default: 4000

avatars: true | {
  default?: Avatar
  ai?: Avatar
  user?: Avatar
  [customRole]?: Avatar
}

Avatar: {
  src?: string
  styles?: {avatar?: CustomStyle, container?: CustomStyle, position?: "start" | "end"}
}

names: true | {
  default?: Name
  ai?: Name
  user?: Name
  [customRole]?: Name
}

Name: {text?: string, style?: CustomStyle, position?: "start" | "end"}
```

## HTML Content

```typescript
htmlClassUtilities: {
  [className: string]: {
    events?: {[eventType: string]: (event: Event) => void}
    styles?: StatefulStyles
  }
}

htmlWrappers: {default?: string, ai?: string, [roleName]?: string}
```

Built-in classes: `deep-chat-button`, `deep-chat-suggestion-button`, `deep-chat-temporary-message`

Intro panel: Insert HTML between `<deep-chat>` tags with `display: none`.

## Files

```typescript
images: true | FilesServiceConfig
gifs: true | FilesServiceConfig
audio: true | FilesServiceConfig
mixedFiles: true | FilesServiceConfig
camera: true | CameraFilesServiceConfig
microphone: true | MicrophoneFilesServiceConfig
dragAndDrop: boolean | CustomStyle

FilesServiceConfig: {
  connect?: Connect
  files?: {maxNumberOfFiles?: number, acceptedFormats?: string, infoModal?: {textMarkDown: string, openModalOnce?: boolean}}
  button?: Button
}

CameraFilesServiceConfig: {
  connect?: Connect
  files?: {format?: "png" | "jpeg", dimensions?: {width?: number, height?: number}, maxNumberOfFiles?: number}
  button?: Button
  modalContainerStyle?: CustomStyle
}

MicrophoneFilesServiceConfig: {
  connect?: Connect
  files?: {format?: "mp3" | "4a" | "webm" | "mp4" | "mpga" | "wav" | "mpeg" | "m4a", maxDurationSeconds?: number, maxNumberOfFiles?: number}
  button?: MicrophoneStyles
}
```

## Speech

```typescript
textToSpeech: true | {
  voiceName?: string
  lang?: string
  pitch?: number
  rate?: number
  volume?: number
  audio?: {autoPlay?: boolean, displayAudio?: boolean, displayText?: boolean}
}

speechToText: true | {
  webSpeech?: boolean | {language?: string}
  azure?: {region: string, subscriptionKey?: string, token?: string, retrieveToken?: () => Promise<string>, language?: string}
  textColor?: CustomStyle
  displayInterimResults?: boolean
  translations?: {[word: string]: string}
  commands?: {stop?: string, pause?: string, resume?: string, submit?: string, removeAllText?: string, commandMode?: string}
  button?: MicrophoneStyles
  stopAfterSubmit?: boolean
  submitAfterSilence?: number
  events?: {onStart?: () => void, onStop?: () => void, onResult?: (text: string, isFinal: boolean) => void}
}
```

## Modes

```typescript
demo: true | {
  response?: Response | ((message: MessageContent) => Response)
  displayErrors?: {default?: boolean, service?: boolean, speechToText?: boolean}
  displayLoading?: {message?: boolean, history?: {full?: boolean, small?: boolean}}
  displayFileAttachmentContainer?: boolean
}

focusMode: true | {smoothScroll?: boolean, streamAutoScroll?: boolean, fade?: true | number}

upwardsMode: boolean
```

## Styling

```typescript
style: CustomStyle  // or chatStyle property
attachmentContainerStyle: CustomStyle
inputAreaStyle: CustomStyle

textInput: {
  styles?: {text?: CustomStyle, container?: CustomStyle, focus?: CustomStyle}
  placeholder?: {text?: string, style?: CustomStyle}
  characterLimit?: number
  disabled?: boolean
}

defaultInput: {text?: string, files?: File[] | FileList}

auxiliaryStyle: string  // CSS syntax for webkit/advanced styling

dropupStyles: {
  button?: Button
  menu?: {container?: CustomStyle, item?: StatefulStyles, iconContainer?: CustomStyle, text?: CustomStyle}
}

messageStyles: {
  default?: MessageRoleStyles
  image?: MessageRoleStyles
  audio?: MessageRoleStyles
  file?: MessageRoleStyles
  html?: MessageRoleStyles
  intro?: MessageElementsStyles
  error?: MessageElementsStyles
  loading?: {message?: LoadingStyles, history?: {full?: LoadingStyles, small?: LoadingStyles}}
}

MessageRoleStyles: {shared?: MessageElementsStyles, user?: MessageElementsStyles, ai?: MessageElementsStyles, [customRole]?: MessageElementsStyles}
MessageElementsStyles: {outerContainer?: CustomStyle, innerContainer?: CustomStyle, bubble?: CustomStyle, media?: CustomStyle}
LoadingStyles: {styles?: MessageElementsStyles, html?: string}

remarkable: {
  xhtmlOut?: boolean
  html?: boolean
  breaks?: boolean
  langPrefix?: string
  linkTarget?: string
  typographer?: boolean
  quotes?: string
  highlight?: (str: string, lang: string) => string
  math?: true | {delimiter?: string, options?: KatexOptions}
  applyHTML?: boolean
}
```

## Buttons

```typescript
submitButtonStyles: {
  submit?: ButtonStyles
  loading?: ButtonStyles
  stop?: ButtonStyles
  disabled?: ButtonStyles
  alwaysEnabled?: boolean
  position?: ButtonPosition
  tooltip?: Tooltip
}

customButtons: Array<{
  styles?: {button?: CustomButtonStyles, dropup?: CustomDropupItemStyles}
  position?: ButtonPosition
  tooltip?: Tooltip
  initialState?: "default" | "active" | "disabled"
  setState?: (newState: CustomButtonState) => void
  onClick?: (currentState: CustomButtonState) => CustomButtonState | void
}>

CustomButtonStyles: {default?: ButtonStyles, active?: ButtonStyles, disabled?: ButtonStyles}
CustomDropupItemStyles: {default?: CustomDropupItemStateStyles, active?: CustomDropupItemStateStyles, disabled?: CustomDropupItemStateStyles}
CustomDropupItemStateStyles: {item?: StatefulStyles, iconContainer?: CustomStyle, text?: CustomStyle}
```

## Types

```typescript
CustomStyle = CSSStyleDeclaration
StatefulStyles: {default?: CustomStyle, hover?: CustomStyle, click?: CustomStyle}

MessageContent: {role?: "ai" | "user" | string, text?: string, html?: string, files?: MessageFile[], custom?: any}
MessageFile: {name?: string, src?: string, type?: "image" | "audio" | "any", ref?: File}  // "image"/"any" with src URL renders as hyperlink
Response: MessageContent & {error?: string, overwrite?: boolean}  // overwrite replaces last message from same role

Button: {styles?: ButtonStyles, position?: ButtonPosition, tooltip?: Tooltip}
ButtonStyles: {container?: StatefulStyles, svg?: ButtonInnerStyles, text?: ButtonInnerStyles}
ButtonInnerStyles: {styles?: StatefulStyles, content?: string}
ButtonPosition: "inside-start" | "inside-end" | "outside-start" | "outside-end" | "dropup-menu"
Tooltip: true | {text?: string, timeout?: number, style?: CustomStyle}
MicrophoneStyles: {default?: ButtonStyles, active?: ButtonStyles, unsupported?: ButtonStyles, position?: ButtonPosition, tooltip?: Tooltip}
```

## Example
```javascript
const chat = document.querySelector('deep-chat');
chat.connect = {
  handler: (body, signals) => {
    fetch('/api/chat', {method: 'POST', body: JSON.stringify(body)})
      .then(res => res.json())
      .then(data => signals.onResponse({text: data.reply}))
      .catch(err => signals.onResponse({error: err.message}));
  }
};
```

**Docs:** https://deepchat.dev/docs
