Chatbox:
chatboxStyle?: CustomStyle;
startWithChatView?: boolean;

When new API is introduced - rename this section to Models:

OpenAI:
key?: string;
openAI?: OpenAI;
requestSettings?: RequestSettings;

Input:
speechInput?: SpeechInput;
inputStyles?: InputStyles;
submitButtonStyles?: SubmitButtonStyles;

Messages:
startMessages?: MessageContent[];
names?: Names;
avatars?: Avatars;
errorMessage?: ErrorMessages;
messageStyles?: CustomMessageStyles;
speechOutput?: boolean;

Methods:
submitUserMessage: (text: string) => void;

Events:
onNewMessage?: OnNewMessage;
