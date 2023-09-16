import React from 'react';

const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// not using @mui/material/Tooltip as by having it on the configuration the modal opens up with no animation
export default function TooltipWrapper({children, text}) {
  // tooltip throws an error on hover in safari
  if (IS_SAFARI) {
    return <a>{children}</a>;
  }

  return (
    <a
      data-tooltip-id="chat-wrapper-configuration-tooltip"
      data-tooltip-place="bottom"
      data-tooltip-offset="7"
      data-tooltip-content={text}
    >
      {children}
    </a>
  );
}
