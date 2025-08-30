export type BigModelToolCall = {
  function: {
    name: string;
    arguments: string;
  };
  id: string;
  type: string;
};

export type BigModelNormalResult = {
  message: {
    role: string;
    content: string;
    tool_calls?: BigModelToolCall[];
  };
};

export type BigModelStreamEvent = {
  delta: {
    role: string;
    content: string;
    tool_calls?: BigModelToolCall[];
  };
  finish_reason?: string;
};

export type BigModelResult = {
  choices: (BigModelNormalResult | BigModelStreamEvent)[];
  error?: {
    message: string;
  };
};

export type BigModelImagesResult = {
  data: [
    {
      url?: string;
    },
  ];
};