import {WebWorkerMLCEngineHandler} from 'deep-chat-web-llm';

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => {
  handler.onmessage(msg);
};
