export const loadingIconStyle = `
  <style>
    .dot-typing {
      position: relative;
      left: -10005px;
      width: 3px;
      height: 3px;
      border-radius: 5px;
      background-color: #848484;
      color: #848484;
      box-shadow: 9990px 0 0 0 #848484, 9995px 0 0 0 #848484, 10001px 0 0 0 #848484;
      animation: dot-typing 1.5s infinite linear;
      bottom: 8px;
    }
    
    @keyframes dot-typing {
      0% {
        box-shadow: 9990px 0 0 0 #848484, 9995px 0 0 0 #848484, 10001px 0 0 0 #848484;
      }
      16.667% {
        box-shadow: 9990px -6px 0 0 #848484, 9995px 0 0 0 #848484, 10001px 0 0 0 #848484;
      }
      33.333% {
        box-shadow: 9990px 0 0 0 #848484, 9995px 0 0 0 #848484, 10001px 0 0 0 #848484;
      }
      50% {
        box-shadow: 9990px 0 0 0 #848484, 9995px -6px 0 0 #848484, 10001px 0 0 0 #848484;
      }
      66.667% {
        box-shadow: 9990px 0 0 0 #848484, 9995px 0 0 0 #848484, 10001px 0 0 0 #848484;
      }
      83.333% {
        box-shadow: 9990px 0 0 0 #848484, 9995px 0 0 0 #848484, 10001px -6px 0 0 #848484;
      }
      100% {
        box-shadow: 9990px 0 0 0 #848484, 9995px 0 0 0 #848484, 10001px 0 0 0 #848484;
      }
    }
  </style>
`;
