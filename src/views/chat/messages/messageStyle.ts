export const messageStyle = `
  <style>
    .messages {
      height: calc(100% - 45px);
      overflow: overlay;
    }
  
    #placeholder-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  
    #placeholder {
      position: relative;
      height: 100%;
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
    }
  </style>
`;
