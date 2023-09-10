import {WebSocket, WebSocketServer} from 'ws';
import {createServer} from 'http';

// ------------------ SETUP ------------------

const server = createServer();

const wss = new WebSocketServer({server});

const port = 8080;

// --------------- CONNECTION ----------------

wss.on('connection', (ws) => {
  console.log('Connection established');
  ws.on('error', console.error);

  ws.on('message', (data) => {
    console.log('Message received');
    // Messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    const message = JSON.parse(data as unknown as string);
    console.log(message);
  });

  // this can be used to test Deep Chat
  recursivelySendMessagesToClient(ws);
});

function recursivelySendMessagesToClient(ws: WebSocket) {
  // Sends response back to Deep Chat using the Response format:
  // https://deepchat.dev/docs/connect/#Response
  setTimeout(() => {
    ws.send(JSON.stringify({text: 'Message from the server'}));
    recursivelySendMessagesToClient(ws);
  }, 3000);
}

// ------------------ START SERVER ------------------

server.listen(port, () => {
  console.log(`Server is running at ws://localhost:${port}`);
});
