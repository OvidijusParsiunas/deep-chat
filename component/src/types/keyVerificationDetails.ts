export interface KeyVerificationDetails {
  url: string;
  method: string;
  body?: string;
  handleVerificationResult: (
    result: object,
    key: string,
    onSuccess: (key: string) => void,
    onFail: (message: string) => void
  ) => void;
}
