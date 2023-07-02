import React from 'react';
import './codeToggle.css';

function Code({isDisplayed, children}) {
  return isDisplayed ? <div>{children}</div> : <div></div>;
}

export default function CodeToggle({children}) {
  const [isDisplayed, setIsDisplayed] = React.useState(false);
  return (
    <div>
      <div className="code-toggle" onClick={() => setIsDisplayed(!isDisplayed)}>
        {isDisplayed ? 'Hide' : 'View'} Code
      </div>
      <Code isDisplayed={isDisplayed}>{children}</Code>
    </div>
  );
}
