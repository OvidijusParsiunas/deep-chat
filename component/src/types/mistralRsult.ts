export type MistralResult = {
  choices: [
    {
      message?: {
        role: string;
        content: string;
      };
      delta?: {
        role?: string;
        content?: string;
      };
      finish_reason?: string;
    },
  ];
  message?: string;
  detail?: string;
};
