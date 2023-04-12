export interface CustomServiceConfig {
  stream?: boolean;
  [key: string]: unknown;
}

export interface CustomServiceResponse {
  content: string;
}
