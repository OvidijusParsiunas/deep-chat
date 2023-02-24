const chatView = document.createElement('template');
chatView.innerHTML = `
  <div>
    <input class="input"></input>
    <button class="call" style="float: left">Call</button>
    <div class="result"></div>
  </div>
`;
export class ChatView {
    constructor(containerRef, key) {
        containerRef.replaceChildren(chatView.content.cloneNode(true));
        this._resultRef = containerRef.getElementsByClassName('result')[0];
        const callButton = containerRef.getElementsByClassName('call')[0];
        const inputElement = containerRef.getElementsByClassName('input')[0];
        callButton.onmousedown = ChatView.callApi.bind(this, key, this._resultRef, inputElement);
    }
    static callApi(key, resultRef, inputElement) {
        fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: new Headers({
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify({
                model: 'text-davinci-003',
                prompt: inputElement.value,
                temperature: 0.9,
                max_tokens: 20,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
            resultRef.innerHTML = data.choices[0].text;
        })
            .catch((err) => console.log(err));
    }
}
//# sourceMappingURL=chatView.js.map