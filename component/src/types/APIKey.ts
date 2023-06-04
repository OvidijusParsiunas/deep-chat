export interface APIKey {
  key?: string;
  validateKeyProperty?: boolean; // can only be used if serviceKey has been set via the apiKey property
}
