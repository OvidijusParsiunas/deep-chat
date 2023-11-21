function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getInterceptorMessage(postInterceptor?: object) {
  return postInterceptor ? JSON.stringify(postInterceptor) : postInterceptor;
}

function getInvalidResponseMessage(result: object, messageType: string, isInterceptor: boolean, postInterceptor?: object) {
  const responseMessage = `\n${capitalizeFirstLetter(messageType)} message: ${JSON.stringify(result)} \n`;
  const interceptorMessage = isInterceptor
    ? `${capitalizeFirstLetter(messageType)} message after interceptor: ${getInterceptorMessage(postInterceptor)} \n`
    : '';
  return (
    `${responseMessage + interceptorMessage}` +
    `Make sure the ${messageType} message is using the Response format: ` +
    'https://deepchat.dev/docs/connect/#Response ' +
    '\n You can also augment it using the responseInterceptor property: ' +
    'https://deepchat.dev/docs/interceptors#responseInterceptor'
  );
}

export const ErrorMessages = {
  INVALID_KEY: 'Invalid API Key',
  CONNECTION_FAILED: 'Failed to connect',
  INVALID_RESPONSE: getInvalidResponseMessage,
  INVALID_STREAM_RESPONSE:
    'Make sure the events are using {text: string} or {html: string} format.' +
    '\n You can also augment them using the responseInterceptor property: ' +
    'https://deepchat.dev/docs/interceptors#responseInterceptor',
  INVALID_STREAM_MIX_RESPONSE: 'Cannot mix {text: string} and {html: string} responses.',
  // reason for this is because there is no standard way to split html
  INVALID_STREAM_SIMULATION_RESPONSE: 'Stream simulation response can only use {text: string} responses.',
};
