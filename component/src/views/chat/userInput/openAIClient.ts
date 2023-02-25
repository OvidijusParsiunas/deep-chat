export interface CompletionResult {
  choices: {text: string}[];
}

export class OpenAIClient {
  public static requestCompletion(key: string, prompt: string, onSuccessfulResult: (result: CompletionResult) => void) {
    fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      }),
      // text-davinci-003
      body: JSON.stringify({
        model: 'text-curie-001',
        prompt: prompt,
        temperature: 0.9,
        max_tokens: 20,
      }),
    })
      .then((response) => response.json())
      .then((result: CompletionResult) => {
        onSuccessfulResult(result);
      })
      .catch((err) => console.log(err));
  }
}
