export type BigModelNormalResult = {
  message: {
    role: string;
    content: string;
  };
};

export type BigModelStreamEvent = {
  delta: {
    role: string;
    content: string;
  };
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
