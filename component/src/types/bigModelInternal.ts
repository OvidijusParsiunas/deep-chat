export type BigModelTextContent = {
  type: 'text';
  text: string;
};

export type BigModelImageContent = {
  type: 'image_url';
  image_url: {
    url: string;
  };
};

export type BigModelVideoContent = {
  type: 'video_url';
  video_url: {
    url: string;
  };
};

export type BigModelFileContent = {
  type: 'file';
  file_url: {
    url: string;
  };
};

export type BigModelContentItem = BigModelTextContent | BigModelImageContent | BigModelVideoContent | BigModelFileContent;

export type BigModelMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | BigModelContentItem[];
};

export type BigModelRequestBody = {
  model: string;
  messages: BigModelMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
};

export type BigModelImagesRequestBody = {
  model: string;
  prompt: string;
};

export type BigModelTextToSpeechRequestBody = {
  model: string;
  input: string;
  voice?: string;
};
