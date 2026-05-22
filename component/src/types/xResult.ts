export type XImageResult = {
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
  error?: {
    message: string;
    type: string;
  };
};

export type XOutputTextContent = {
  type: 'output_text';
  text: string;
  annotations?: unknown[];
};

export type XOutputMessage = {
  type: 'message';
  role: 'assistant';
  content: XOutputTextContent[];
};

export type XNormalResult = {
  id: string;
  object: 'response';
  created_at: number;
  model: string;
  status: 'completed' | 'in_progress' | 'incomplete';
  output: Array<XOutputMessage | {type: string}>;
  error?: {
    message: string;
    type: string;
  };
};

export type XStreamEvent = {
  type: string;
  delta?: string;
  item_id?: string;
  output_index?: number;
  content_index?: number;
  sequence_number?: number;
  error?: {
    message: string;
    type: string;
  };
};

export type XResult = XNormalResult | XStreamEvent;
