import {AddNewMessage} from '../messages/messages';

export class OpenAIClient {
  public static requestCompletion(key: string, prompt: string, addNewMessage: AddNewMessage) {
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
      .then((data) => {
        addNewMessage(data.choices[0].text as string);
      })
      .catch((err) => console.log(err));
  }
}
