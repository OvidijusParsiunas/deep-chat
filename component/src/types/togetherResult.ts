export type TogetherNormalResult = {
  message: {
    role: string;
    content: string;
  };
};

export type TogetherStreamEvent = {
  index: number;
  text: string;
  logprobs: null;
  finish_reason: null;
  seed: null;
  delta: {
    token_id: number;
    role: string;
    content: string;
    tool_calls: null;
  };
};

export type TogetherResult = {
  choices: (TogetherNormalResult | TogetherStreamEvent)[];
  error?: {
    message: string;
  };
};

export type TogetherImagesResult = {
  data: [
    {
      url?: string;
      b64_json?: string;
    },
  ];
};
