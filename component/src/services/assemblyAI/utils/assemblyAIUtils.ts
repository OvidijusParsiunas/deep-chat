import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {OpenAIConverseResult} from '../../../types/openAIResult';

export class AssemblyAIUtils {
  public static async poll(api_token: string, audio_url: string) {
    // Set the headers for the request, including the API token and content type
    const headers = {
      authorization: api_token,
      'content-type': 'application/json',
    };

    // Send a POST request to the transcription API with the audio URL in the request body
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
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
      if (transcriptionResult.status === 'completed') {
        result = transcriptionResult;
      }
      // If the transcription has failed, throw an error with the error message
      else if (transcriptionResult.status === 'error') {
        throw new Error(`Transcription failed: ${transcriptionResult.error}`);
      }
      // If the transcription is still in progress, wait for a few seconds before polling again
      else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
    return result as {text: string};
  }

  public static buildHeaders(key: string) {
    return {
      Authorization: key,
      'Content-Type': 'application/octet-stream',
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const openAIResult = result as OpenAIConverseResult;
    if (openAIResult.error) {
      if (openAIResult.error.code === 'invalid_api_key') {
        onFail(ErrorMessages.INVALID_KEY);
      } else {
        onFail(ErrorMessages.CONNECTION_FAILED);
      }
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.assemblyai.com/v2/upload',
      method: 'POST',
      handleVerificationResult: AssemblyAIUtils.handleVerificationResult,
    };
  }
}
