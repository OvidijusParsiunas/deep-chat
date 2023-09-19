import TooltipWrapper from '../tooltip/playgroundTooltipWrapper';
import React from 'react';

// TO-DO - settings toggle for the config to always be visible
// prettier-ignore
export default function PlaygroundChatWrapperConfig(
    {setEditingChatRef, cloneComponent, removeComponent, clearMessages, wrapperRef}) {
  return (
    <div className="playground-chat-config-buttons">
      <img className="playground-chat-drag-handle" src="/img/drag-handle.svg"></img>
      <TooltipWrapper text="Configure">
        <svg onClick={() => setEditingChatRef(wrapperRef)} className="playground-chat-config-button playground-button" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M262.749 410.667H.000648499V282.667H262.749C292.139 145.504 414.06 42.6667 560 42.6667 705.94 42.6667 827.861 145.504 857.251 282.667H1920V410.667H857.251C827.861 547.829 705.94 650.667 560 650.667 414.06 650.667 292.139 547.829 262.749 410.667ZM384 346.667C384 249.465 462.798 170.667 560 170.667 657.202 170.667 736 249.465 736 346.667 736 443.869 657.202 522.667 560 522.667 462.798 522.667 384 443.869 384 346.667ZM.000648499 896H1009.42C1038.81 758.837 1160.73 656 1306.67 656 1452.61 656 1574.53 758.837 1603.92 896H1920V1024H1603.92C1574.53 1161.16 1452.61 1264 1306.67 1264 1160.73 1264 1038.81 1161.16 1009.42 1024H.000648499V896ZM1306.67 784C1209.46 784 1130.67 862.798 1130.67 960 1130.67 1057.2 1209.46 1136 1306.67 1136 1403.87 1136 1482.67 1057.2 1482.67 960 1482.67 862.798 1403.87 784 1306.67 784ZM857.251 1637.33C827.861 1774.5 705.94 1877.33 560 1877.33 414.06 1877.33 292.139 1774.5 262.749 1637.33H.000648499V1509.33H262.749C292.139 1372.17 414.06 1269.33 560 1269.33 705.94 1269.33 827.861 1372.17 857.251 1509.33H1920V1637.33H857.251ZM384 1573.33C384 1476.13 462.798 1397.33 560 1397.33 657.202 1397.33 736 1476.13 736 1573.33 736 1670.54 657.202 1749.33 560 1749.33 462.798 1749.33 384 1670.54 384 1573.33Z"/>
        </svg>
        {/* <Cog className="playground-chat-config-button" onClick={() => setEditingChatRef(ref)} /> */}
      </TooltipWrapper>
      <TooltipWrapper text="Clear messages">
        <svg onClick={() => clearMessages()} className="playground-chat-config-button playground-chat-clear-button playground-button" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12.6l.7.7 1.6-1.6 1.6 1.6.8-.7L13 11l1.7-1.6-.8-.8-1.6 1.7-1.6-1.7-.7.8 1.6 1.6-1.6 1.6zM1 4h14V3H1v1zm0 3h14V6H1v1zm8 2.5V9H1v1h8v-.5zM9 13v-1H1v1h8z"/>
        </svg>
      </TooltipWrapper>
      <TooltipWrapper text="Clone">
        <svg onClick={() => cloneComponent(wrapperRef)} className="playground-chat-config-button playground-chat-clone-button playground-button" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736 5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z" stroke="#1C274C" strokeWidth="1.5"/>
          <path d="M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18 3.34315 18 5" stroke="#1C274C" strokeWidth="1.5"/>
        </svg>
      </TooltipWrapper>
      <TooltipWrapper text="Remove">
        <svg onClick={() => removeComponent(wrapperRef)} className="playground-chat-config-button playground-chat-remove-button playground-button" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <g>
            <g><path d="M316.325,44.522V0H195.68l-0.003,44.522H61.217v87.982h21.616c3.975,75.409,20.548,350.983,21.319,363.803L105.097,512
                h301.806l0.944-15.694c0.771-12.821,17.345-288.394,21.319-363.803h21.616V44.522H316.325z M229.069,33.391h53.866v11.13h-53.866
                V33.391z M375.458,478.609H136.542c-3.633-60.548-16.681-278.597-20.27-346.105h279.456
                C392.14,200.012,379.091,418.06,375.458,478.609z M417.391,99.112H94.609V77.913h322.783V99.112z"/></g>
          </g>
          <g>
            <g><rect x="239.304" y="167.947" width="33.391" height="280.031"/></g>
          </g>
          <g>
            <g><rect x="160.292" y="168.19" transform="matrix(0.9986 -0.0521 0.0521 0.9986 -15.8157 9.64)" width="33.39" height="279.952"/></g>
          </g>
          <g>
            <g><rect x="195.052" y="291.462" transform="matrix(0.0521 -0.9986 0.9986 0.0521 9.8344 626.6741)" width="279.952" height="33.39"/></g>
          </g>
        </svg>
      </TooltipWrapper>
    </div>
  );
}
