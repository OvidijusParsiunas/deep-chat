// Template for the Web Worker that runs the web model off the main thread.
// Pass a Worker created from this script to Deep Chat via `webModel.worker`.
//
// import {WebWorkerMLCEngineHandler} from 'deep-chat-web-llm';
//
// const handler = new WebWorkerMLCEngineHandler();
// self.onmessage = (msg: MessageEvent) => {
//   handler.onmessage(msg);
// };
