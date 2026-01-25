import {DifyBlockingResponse, DifyStreamPayload, DifyStreamEvent, UploadResponse} from '../../../types/difyResult';
import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {DifyUploadConfig, DifyFileInput, DifyFileType} from '../../../types/difyInternal';
import {ERROR, FILE, IMAGE, TEXT, USER} from '../../../utils/consts/messageConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {Response as ResponseI} from '../../../types/response';
import {
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
  UNAUTHORIZED,
  POST,
  GET,
} from '../../utils/serviceConstants';

type DifyErrorResponse = {
  error?: {
    message: string;
  };
};

const IMAGE_MIME_PREFIX = 'image/';
const SSE_DATA_PREFIX = 'data:';

const createFileInput = (fileId: string, type: DifyFileType): DifyFileInput => ({
  type,
  transfer_method: 'local_file',
  upload_file_id: fileId,
});

const parseSSEEventBlock = (eventBlock: string): DifyStreamPayload | null => {
  const trimmedBlock = eventBlock.trim();
  if (!trimmedBlock.startsWith(SSE_DATA_PREFIX)) return null;

  const jsonStr = trimmedBlock.replace(/^data:\s*/, '').trim();
  if (!jsonStr) return null;
  return JSON.parse(jsonStr);
};

export async function uploadFile(file: File, config: DifyUploadConfig): Promise<string> {
  const formData = new FormData();
  formData.append(FILE, file);
  formData.append(USER, config[USER]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {[CONTENT_TYPE_H_KEY]: _, ...headers} = config.headers;

  const response = await fetch(config.url, {method: POST, headers, body: formData});

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const data = (await response.json()) as UploadResponse;

  if (!data.id) throw new Error('Upload response missing file ID');

  return data.id;
}

export async function uploadFiles(files: File[], config: DifyUploadConfig): Promise<DifyFileInput[]> {
  if (files.length === 0) return [];

  const uploadPromises = files.map(async (file): Promise<DifyFileInput | null> => {
    const fileId = await uploadFile(file, config);
    const fileType = file.type.startsWith(IMAGE_MIME_PREFIX) ? IMAGE : FILE;
    return createFileInput(fileId, fileType);
  });

  const results = await Promise.all(uploadPromises);
  return results.filter((item): item is DifyFileInput => item !== null);
}

export function parseBlockingResponse(
  result: DifyBlockingResponse,
  onConversationIdUpdate: (id: string) => void
): ResponseI {
  if (result.conversation_id) onConversationIdUpdate(result.conversation_id);
  if (result.code && result.message && !result.answer) return {[ERROR]: result.message};
  return {[TEXT]: result.answer || ''};
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
      state.errorMessage = payload.message || DifyStreamEvent.ERROR;
      break;
    default:
      break;
  }
};

export async function parseStreamingResponse(
  result: Blob,
  onConversationIdUpdate: (id: string) => void
): Promise<ResponseI> {
  const state = {fullAnswer: '', conversationIdSet: false, errorMessage: ''};
  const text = await result.text();
  const events = text.split(/\r?\n\r?\n/);

  for (const eventBlock of events) {
    const payload = parseSSEEventBlock(eventBlock);
    if (!payload) continue;

    processStreamEvent(payload, state, onConversationIdUpdate);
  }

  if (state.errorMessage) return {[ERROR]: state.errorMessage};

  return {[TEXT]: state.fullAnswer};
}

export const DIFY_BUILD_HEADERS = (key?: string) => {
  return {
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
    [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
  };
};

const handleVerificationResult = (
  result: object,
  key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const difyResult = result as DifyErrorResponse;
  if (difyResult[ERROR]) {
    if (difyResult[ERROR].message === UNAUTHORIZED) {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else if ('user_input_form' in result || 'opening_statement' in result || 'file_upload' in result) {
    onSuccess(key);
  } else {
    onFail(CONNECTION_FAILED);
  }
};

export const DIFY_BUILD_KEY_VERIFICATION_DETAILS = (baseUrl: string): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS(`${baseUrl}/parameters`, GET, handleVerificationResult);
};
