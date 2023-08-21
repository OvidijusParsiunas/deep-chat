function getInterceptorMessage(postInterceptor?: object) {
  return postInterceptor ? JSON.stringify(postInterceptor) : postInterceptor;
}

function getInvalidResponseMessage(result: object, isInterceptor: boolean, postInterceptor?: object) {
  const responseMessage = `\nResponse message: ${JSON.stringify(result)} \n`;
  const interceptorMessage = isInterceptor
    ? `Response message after interceptor: ${getInterceptorMessage(postInterceptor)} \n`
    : '';
  return (
    `${responseMessage + interceptorMessage}` +
    'Make sure the response message is using the Result format: ' +
    'https://deepchat.dev/docs/connect/#Result ' +
    '\n You can also augment it using the responseInterceptor property: ' +
    'https://deepchat.dev/docs/interceptors#responseInterceptor'
  );
}

export const ErrorMessages = {
  INVALID_KEY: 'Invalid API Key',
  CONNECTION_FAILED: 'Failed to connect',
  INVALID_RESPONSE_FORMAT: getInvalidResponseMessage,
  INVALID_STREAM_FORMAT:
    `Make sure the events are using the Result format: ` +
    `https://deepchat.dev/docs/connect/#Result \n` +
    `You can also augment them using the responseInterceptor property: ` +
    `https://deepchat.dev/docs/interceptors#responseInterceptor`,
};
