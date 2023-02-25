export const userInputStyle = `
  <style>
    .user-input {
      width: 80%;
      text-align: center;
      margin-left: auto;
      margin-right: auto;
      margin-top: auto;
      position: relative;
    }
    #input-content-container {
      background-color: white;
      width: 100%;
      display: flex;
      border: 1px solid #0000001a;
      border-radius: 5px;
      margin-top: 10px;
      margin-bottom: 10px;
      box-shadow: rgba(149, 157, 165, 0.2) 0px 1px 12px;
      overflow-y: auto;
      /* Make the minimum height as 200px */
      max-height: 200px;
    }
    #input {
      width: calc(100% - 25px);
      text-align: left;
      outline: none;
      padding: 5px 0px 5px 5px;
    }
    #submit-button {
      position: absolute;
      right: 4px;
      bottom: 13px;
      width: 22px;
      height: 22px;
      border-radius: 4px;
      cursor: pointer;
    }
    #icon {
      position: absolute;
      right: -4px;
      top: -1px;
    }
    #submit-button:hover {
      background-color: #9c9c9c2e;
    }
    #submit-button:active {
      background-color: #9c9c9c5e;
    }
  </style>
`;
