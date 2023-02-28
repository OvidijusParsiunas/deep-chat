export interface CompletionResult {
  choices: {text: string}[];
  error?: {code: string};
}
