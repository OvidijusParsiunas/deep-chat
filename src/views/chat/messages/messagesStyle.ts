export const messagesStyle = `
  <style>
    .messages {
      overflow: auto;
    }
  
    #placeholder-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  
    #placeholder {
      position: relative;
      height: 180%;
    }

    .message {
      border-color: #0000001a;
    }

    .message-text {
      width: 90%;
      margin-left: auto;
      margin-right: auto;
      color: rgba(52,53,65);
      padding-top: 10px;
      padding-bottom: 10px;
      word-wrap: break-word;
    }
  </style>
`;
