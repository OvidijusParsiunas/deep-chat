import {DifyBlockingResponse, DifyFileInput, DifyStreamEvent, DifyUploadConfig} from '../../../types/dify';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {MessageContentI} from '../../../types/messagesInternal';
import {Response as ResponseI} from '../../../types/response';
import { ERROR } from '../../../utils/consts/messageConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {APPLICATION_JSON, BEARER_PREFIX, CONTENT_TYPE_H_KEY} from '../../utils/serviceConstants';

export async function uploadFileToDify(file: File, config: DifyUploadConfig): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user', config.user);

  // Remove Content-Type to let browser set boundary for FormData
  const requestHeaders = {...config.headers};
  delete requestHeaders[CONTENT_TYPE_H_KEY];

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: requestHeaders,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (e) {
    console[ERROR]('[Dify] File upload network error:');
    console[ERROR](e);
    throw e;
  }
}

export async function uploadFilesToDify(files: File[], config: DifyUploadConfig): Promise<DifyFileInput[]> {
  const uploadPromises = files.map(async (file) => {
    try {
      const fileId = await uploadFileToDify(file, config);

      const type = file.type.startsWith('image/') ? 'image' : 'file';

      return {
        type: type,
        transfer_method: 'local_file',
        upload_file_id: fileId,
      } as DifyFileInput;
    } catch (_e) {
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  const successfulUploads = results.filter((item): item is DifyFileInput => item !== null);

  if (successfulUploads.length !== files.length) {
    console.warn(`[Dify] Only ${successfulUploads.length}/${files.length} files uploaded successfully.`);
  }

  return successfulUploads;
}

export function parseDifyBlockingResponse(
  result: DifyBlockingResponse,
  onConversationIdUpdate: (id: string) => void
): ResponseI {
  if (result.conversation_id) {
    onConversationIdUpdate(result.conversation_id);
  }
  // Check for error in response body
  if (result.code && result.message && !result.answer) {
    return {error: result.message};
  }
  return {text: result.answer || ''};
}

/**
 * Parse streaming response (SSE)
 * Note: Since DirectServiceIO passes a Blob (completed request), this parses the
 * accumulated SSE events.
 */
export async function parseDifyStreamingResponse(
  result: Blob,
  onConversationIdUpdate: (id: string) => void
): Promise<ResponseI> {
  const text = await result.text();
  const events = text.split(/\r?\n\r?\n/);

  let fullAnswer = '';
  let conversationIdSet = false;
  let errorMessage = '';

  for (const eventBlock of events) {
    const trimmedBlock = eventBlock.trim();
    if (!trimmedBlock.startsWith('data:')) continue;

    const jsonStr = trimmedBlock.replace(/^data:\s*/, '').trim();
    if (!jsonStr) continue;

    try {
      const payload = JSON.parse(jsonStr);

      if (!conversationIdSet && payload.conversation_id) {
        onConversationIdUpdate(payload.conversation_id);
        conversationIdSet = true;
      }

      switch (payload.event) {
        case DifyStreamEvent.MESSAGE:
        case DifyStreamEvent.AGENT_MESSAGE:
          fullAnswer += payload.answer || '';
          break;

        case DifyStreamEvent.WORKFLOW_FINISHED:
          if (!fullAnswer && payload.data?.outputs?.answer) {
            fullAnswer = payload.data.outputs.answer;
          }
          break;

        case DifyStreamEvent.ERROR:
          console[ERROR]('[Dify API Error Event]', payload);
          errorMessage = payload.message || 'Unknown Dify API Error';
          break;

        case DifyStreamEvent.PING:
          break;
      }
    } catch (e) {
      console.warn('Error parsing Dify stream chunk:', jsonStr, e);
    }
  }

  if (errorMessage) {
    return {error: errorMessage};
  }

  return {text: fullAnswer};
}

export const DIFY_BUILD_HEADERS = (key: string) => {
  return {
    Authorization: `${BEARER_PREFIX}${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

export const DIFY_BUILD_KEY_VERIFICATION_DETAILS = (baseUrl: string): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS(`${baseUrl}/parameters`, 'GET', (result: object): boolean => {
    return !!result && ('user_input_form' in result || 'opening_statement' in result || 'file_upload' in result);
  });
};

export const preprocessBody = ({
  msgs,
  files,
  conversationId,
  user,
  mode,
  inputs,
}: {
  msgs: MessageContentI[];
  files?: DifyFileInput[];
  conversationId: string;
  user: string;
  mode: string;
  inputs: Record<string, unknown>;
}) => {
  const lastMessage = msgs[msgs.length - 1];
  const query = lastMessage?.text || ' ';

  return {
    inputs: inputs,
    query,
    response_mode: mode,
    user: user,
    ...(conversationId ? {conversation_id: conversationId} : {}),
    ...(files && files.length > 0 ? {files} : {}),
  };
};
