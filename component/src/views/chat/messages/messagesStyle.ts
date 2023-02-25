export const messagesStyle = `
  <style>
    .messages {
      overflow: auto;
      /* have this set for placeholder
        display: contents;        
      */
    }
  
    #placeholder {
      position: relative;
      /* have this set when using placeholder
        height: 180%;
      */
      height: 100%;
    }

    #placeholder-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
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
