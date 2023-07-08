import {DeepChat} from 'deep-chat-react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Deep Chat</h1>
      <DeepChat
        containerStyle={{borderRadius: '10px'}}
        introMessage="Send a message to the server!"
        request={{url: 'http://localhost:8080/v1/chat/completions'}}
      />
    </div>
  );
}

export default App;
