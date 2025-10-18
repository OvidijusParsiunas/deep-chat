import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {OpenAIConverseResult} from '../../../types/openAIResult';
import {ERROR} from '../../../utils/consts/messageConstants';
import {
  CONTENT_TYPE_H_KEY,
  CONTENT_TYPE_L_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  AUTHORIZATION_L,
  COMPLETED,
  POST,
} from '../../utils/serviceConstants';

export const ASSEMBLY_AI_POLL = async (api_token: string, audio_url: string) => {
  // Set the headers for the request, including the API token and content type
  const headers = {
    [AUTHORIZATION_L]: api_token,
    [CONTENT_TYPE_L_KEY]: APPLICATION_JSON,
  };

  // Send a POST request to the transcription API with the audio URL in the request body
  const response = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: POST,
    body: JSON.stringify({audio_url}),
    headers,
  });

  // Retrieve the ID of the transcript from the response data
  const responseData = await response.json();
  const transcriptId = responseData.id;

  // Construct the polling endpoint URL using the transcript ID
  const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;

  let result: {text: string} | undefined;
  // Poll the transcription API until the transcript is ready
  while (!result) {
    // Send a GET request to the polling endpoint to retrieve the status of the transcript
    const pollingResponse = await fetch(pollingEndpoint, {headers});
    const transcriptionResult = await pollingResponse.json();
    // If the transcription is complete, return the transcript object
    if (transcriptionResult.status === COMPLETED) {
      result = transcriptionResult;
    }
    // If the transcription has failed, throw an error with the error message
    else if (transcriptionResult.status === ERROR) {
      throw new Error(`Transcription failed: ${transcriptionResult[ERROR]}`);
    }
    // If the transcription is still in progress, wait for a few seconds before polling again
    else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  return result as {text: string};
};

export const ASSEMBLY_AI_BUILD_HEADERS = (key: string) => {
  return {
    [AUTHORIZATION_H]: key,
    [CONTENT_TYPE_H_KEY]: 'application/octet-stream',
  };
};

// prettier-ignore
const handleVerificationResult = (result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) => {
    const openAIResult = result as OpenAIConverseResult;
    if (openAIResult[ERROR]) {
      if (openAIResult[ERROR].code === 'invalid_api_key') {
        onFail(INVALID_KEY);
      } else {
        onFail(CONNECTION_FAILED);
      }
    } else {
      onSuccess(key);
    }
  };

export const ASSEMBLY_AI_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('https://api.assemblyai.com/v2/upload', POST, handleVerificationResult);
};
