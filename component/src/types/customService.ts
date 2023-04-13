export interface CustomServiceConfig {
  stream?: boolean;
  [key: string]: unknown;
}

export interface CustomServiceResponse {
  aiMessage: string;
  error: string;
}
