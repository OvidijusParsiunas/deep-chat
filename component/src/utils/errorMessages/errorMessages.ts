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
    'https://deepchat.dev/docs/connect/#Response ' +
    '\nYou can also augment it using the responseInterceptor property: ' +
    'https://deepchat.dev/docs/interceptors#responseInterceptor'
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

const INVALID_STREAM_EVENT =
  'Make sure the events are using {text: string} or {html: string} format.' +
  '\nYou can also augment them using the responseInterceptor property: ' +
  'https://deepchat.dev/docs/interceptors#responseInterceptor';

export const ErrorMessages = {
  INVALID_KEY: 'Invalid API Key',
  CONNECTION_FAILED: 'Failed to connect',
  INVALID_RESPONSE: getInvalidResponseMessage,
  INVALID_MODEL_REQUEST: getModelRequestMessage,
  INVALID_MODEL_RESPONSE: getModelResponseMessage,
  INVALID_STREAM_EVENT,
  INVALID_STREAM_EVENT_MIX: 'Cannot mix {text: string} and {html: string} responses.',
  NO_VALID_STREAM_EVENTS_SENT: `No valid stream events were sent.\n${INVALID_STREAM_EVENT}`,
};
