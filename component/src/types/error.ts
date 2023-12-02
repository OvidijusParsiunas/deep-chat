export interface ErrorMessageOverrides {
  default?: string;
  service?: string;
  speechToText?: string;
}

export interface ErrorMessages {
  // automatically display all error messages from the service, all others automatically default
  // to the normal error structure -> type of message -> default -> 'Error, please try again.'
  displayServiceErrorMessages?: boolean;
  overrides?: ErrorMessageOverrides;
}

export type OnError = (error: string) => void;
