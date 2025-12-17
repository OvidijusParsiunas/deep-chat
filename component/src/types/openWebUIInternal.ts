import {OpenWebUITool} from './openWebUI';

export interface OpenWebUIMessage {
  role: string;
  content: string | {type: 'text' | 'image_url'; text?: string; image_url?: {url: string}}[];
}

export interface OpenWebUIFile {
  type: 'file' | 'collection';
  id: string;
}

export interface OpenWebUIConverseBodyInternal {
  model: string;
  messages: OpenWebUIMessage[];
  files?: OpenWebUIFile[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  tools?: OpenWebUITool[];
}