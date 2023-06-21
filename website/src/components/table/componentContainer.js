import React from 'react';

export function extractChildChatElement(containerElement) {
  return containerElement?.children[0]?.children[0];
}

export default function ComponentContainer({children, minHeight}) {
  return (
    <div className="documentation-example-container" style={{minHeight: `${minHeight || 400}px`}}>
      <div>{children}</div>
    </div>
  );
}
