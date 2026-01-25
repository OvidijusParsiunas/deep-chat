import {
  DifyBlockingResponse,
  DifyFileInput,
  DifyFileType,
  DifyRequestBody,
  DifyStreamEvent,
  DifyStreamPayload,
  DifyUploadConfig,
  PreprocessBodyParams,
  UploadResponse,
} from '../../../types/dify';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {Response as ResponseI} from '../../../types/response';
import {ERROR} from '../../../utils/consts/messageConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {APPLICATION_JSON, BEARER_PREFIX, CONTENT_TYPE_H_KEY} from '../../utils/serviceConstants';

const IMAGE_MIME_PREFIX = 'image/';
const SSE_DATA_PREFIX = 'data:';
const DEFAULT_QUERY = ' ';

const isImageFile = (mimeType: string): boolean => mimeType.startsWith(IMAGE_MIME_PREFIX);

const createDifyFileInput = (fileId: string, type: DifyFileType): DifyFileInput => ({
  type,
  transfer_method: 'local_file',
  upload_file_id: fileId,
});

const parseSSEEventBlock = (eventBlock: string): DifyStreamPayload | null => {
  const trimmedBlock = eventBlock.trim();
  if (!trimmedBlock.startsWith(SSE_DATA_PREFIX)) return null;

  const jsonStr = trimmedBlock.replace(/^data:\s*/, '').trim();
  if (!jsonStr) return null;

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn('[Dify] Error parsing stream chunk:', jsonStr, e);
    return null;
  }
};

export async function uploadFileToDify(file: File, config: DifyUploadConfig): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user', config.user);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {[CONTENT_TYPE_H_KEY]: _, ...requestHeaders} = config.headers;

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: requestHeaders,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[Dify] Upload failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as UploadResponse;

    if (!data.id) {
      throw new Error('[Dify] Upload response missing file ID');
    }

    return data.id;
  } catch (error) {
    console[ERROR]('[Dify] File upload error:', error);
    throw error;
  }
}

export async function uploadFilesToDify(files: File[], config: DifyUploadConfig): Promise<DifyFileInput[]> {
  if (files.length === 0) return [];

  const uploadPromises = files.map(async (file): Promise<DifyFileInput | null> => {
    try {
      const fileId = await uploadFileToDify(file, config);
      const fileType = isImageFile(file.type) ? 'image' : 'file';
      return createDifyFileInput(fileId, fileType);
    } catch (error) {
      console.warn(`[Dify] Failed to upload file: ${file.name}`, error);
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  const successfulUploads = results.filter((item): item is DifyFileInput => item !== null);

  if (successfulUploads.length < files.length) {
    const failedCount = files.length - successfulUploads.length;
    console.warn(`[Dify] ${failedCount}/${files.length} files failed to upload`);
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

  if (result.code && result.message && !result.answer) {
    return {error: result.message};
  }

  return {text: result.answer || ''};
}

const processStreamEvent = (
  payload: DifyStreamPayload,
  state: {fullAnswer: string; conversationIdSet: boolean; errorMessage: string},
  onConversationIdUpdate: (id: string) => void
): void => {
  if (!state.conversationIdSet && payload.conversation_id) {
    onConversationIdUpdate(payload.conversation_id);
    state.conversationIdSet = true;
  }

  switch (payload.event) {
    case DifyStreamEvent.MESSAGE:
    case DifyStreamEvent.AGENT_MESSAGE:
      state.fullAnswer += payload.answer || '';
      break;

    case DifyStreamEvent.WORKFLOW_FINISHED:
      if (!state.fullAnswer && payload.data?.outputs?.answer) {
        state.fullAnswer = payload.data.outputs.answer;
      }
      break;

    case DifyStreamEvent.ERROR:
      console[ERROR]('[Dify] API Error Event:', payload);
      state.errorMessage = payload.message || 'Unknown Dify API Error';
      break;

    case DifyStreamEvent.PING:
    case DifyStreamEvent.AGENT_THOUGHT:
    case DifyStreamEvent.MESSAGE_END:
    case DifyStreamEvent.MESSAGE_REPLACE:
      break;

    default:
      break;
  }
};

export async function parseDifyStreamingResponse(
  result: Blob,
  onConversationIdUpdate: (id: string) => void
): Promise<ResponseI> {
  const text = await result.text();
  const events = text.split(/\r?\n\r?\n/);

  const state = {
    fullAnswer: '',
    conversationIdSet: false,
    errorMessage: '',
  };

  for (const eventBlock of events) {
    const payload = parseSSEEventBlock(eventBlock);
    if (!payload) continue;

    processStreamEvent(payload, state, onConversationIdUpdate);
  }

  if (state.errorMessage) {
    return {error: state.errorMessage};
  }

  return {text: state.fullAnswer};
}

export const DIFY_BUILD_HEADERS = (key: string): Record<string, string> => ({
  Authorization: `${BEARER_PREFIX}${key}`,
  [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
});

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
}: PreprocessBodyParams): DifyRequestBody => {
  const lastMessage = msgs[msgs.length - 1];
  const query = lastMessage?.text || DEFAULT_QUERY;

  const body: DifyRequestBody = {
    inputs,
    query,
    response_mode: mode,
    user,
  };

  if (conversationId) {
    body.conversation_id = conversationId;
  }

  if (files && files.length > 0) {
    body.files = files;
  }

  return body;
};
