import {DOCS_BASE_URL} from '../consts/messageConstants';

function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getInterceptorMessage(postInterceptor?: object) {
  return postInterceptor ? JSON.stringify(postInterceptor) : postInterceptor;
}

function getInterceptorMesages(result: object, messageType: string, isInterceptor: boolean, postInterceptor?: object) {
  const responseMessage = `\n${capitalizeFirstLetter(messageType)} message: ${JSON.stringify(result)} \n`;
  const interceptorMessage = isInterceptor
    ? `${capitalizeFirstLetter(messageType)} message after interceptor: ${getInterceptorMessage(postInterceptor)} \n`
    : '';
  return responseMessage + interceptorMessage;
}

function getInvalidResponseMessage(result: object, messageType: string, isInterceptor: boolean, postInterceptor?: object) {
  return (
    `${getInterceptorMesages(result, messageType, isInterceptor, postInterceptor)}` +
    `Make sure the ${messageType} message is using the Response format: ` +
    `${DOCS_BASE_URL}connect/#Response ` +
    '\nYou can also augment it using the responseInterceptor property: ' +
    `${DOCS_BASE_URL}interceptors#responseInterceptor`
  );
}

function getModelResponseMessage(result: object, isInterceptor: boolean, postInterceptor?: object) {
  const messageType = 'response';
  return (
    `${getInterceptorMesages(result, messageType, isInterceptor, postInterceptor)}` +
    `Make sure the ${messageType} message is using the {text: string} format, e.g: {text: "Model Response"}`
  );
}

function getModelRequestMessage(result: object, isInterceptor: boolean) {
  const messageType = 'request';
  return (
    `${getInterceptorMesages(result, messageType, isInterceptor)}` +
    `Make sure the ${messageType} message is using the {body: {text: string}} format, ` +
    `e.g: {body: {text: "Model Response"}}`
  );
}

function getFunctionFailedMessage(name: string) {
  return `${name} failed - please wait for chat view to render before calling this property.`;
}

export const INVALID_RESPONSE = getInvalidResponseMessage;
export const INVALID_MODEL_REQUEST = getModelRequestMessage;
export const INVALID_MODEL_RESPONSE = getModelResponseMessage;
export const FUNCTION_FAILED_WAIT_FOR_RENDER = getFunctionFailedMessage;
export const INVALID_KEY = 'Invalid API Key';
export const CONNECTION_FAILED = 'Failed to connect';
export const REQUEST_SETTINGS_ERROR = 'Request settings have not been set up';
export const NO_FILE_ADDED_ERROR = 'No file was added';
export const IMAGE_NOT_FOUND_ERROR = 'Image was not found';
export const INVALID_STREAM_ARRAY_RESPONSE = 'Multi-response arrays are not supported for streaming';
export const INVALID_STREAM_EVENT =
  'Make sure the events are using {text: string} or {html: string} format.' +
  '\nYou can also augment them using the responseInterceptor property: ' +
  `${DOCS_BASE_URL}interceptors#responseInterceptor`;
export const INVALID_STREAM_EVENT_MIX = 'Cannot mix {text: string} and {html: string} responses.';
export const NO_VALID_STREAM_EVENTS_SENT = `No valid stream events were sent.\n${INVALID_STREAM_EVENT}`;
export const READABLE_STREAM_CONNECTION_ERROR = 'Readable Stream connection error.';
export const DEFINE_FUNCTION_HANDLER = 'Please define a `function_handler` property inside the service config.';
export const FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR = 'Function tool response must be an array or contain a text property';
export const FAILED_TO_FETCH_HISTORY = 'Failed to fetch history';
