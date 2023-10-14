import ComponentContainer from './componentContainer';
import DeepChatBrowser from './deepChatBrowser';
import React from 'react';

export default function ComponentSuggestionButtons() {
  const ref = React.createRef(null);
  return (
    <div ref={ref}>
      <ComponentContainer>
        <DeepChatBrowser
          demo={true}
          htmlClassUtilities={{
            ['custom-button']: {
              events: {
                click: (event) => {
                  const component = ref.current?.children[0]?.children[0]?.children[0];
                  if (component) {
                    const text = event.target.children[0].innerText;
                    component.submitUserMessage(text.substring(1, text.length - 1));
                  }
                },
              },
              styles: {
                default: {
                  backgroundColor: '#f2f2f2',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                },
                hover: {backgroundColor: '#ebebeb'},
                click: {backgroundColor: '#e4e4e4'},
              },
            },
            ['custom-button-text']: {
              styles: {
                default: {
                  pointerEvents: 'none',
                },
              },
            },
          }}
          style={{height: '370px', borderRadius: '8px'}}
        >
          <div style={{display: 'none'}}>
            <div className="custom-button">
              <div className="custom-button-text">"Explain quantum computing"</div>
            </div>
            <div className="custom-button" style={{marginTop: 15}}>
              <div className="custom-button-text">"Creative ideas for a birthday"</div>
            </div>
            <div className="custom-button" style={{marginTop: 15}}>
              <div className="custom-button-text">"Hello World in JavaScript"</div>
            </div>
          </div>
        </DeepChatBrowser>
      </ComponentContainer>
    </div>
  );
}
