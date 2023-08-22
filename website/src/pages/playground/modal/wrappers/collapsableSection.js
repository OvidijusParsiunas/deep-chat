import './collapsableSection.css';
import React from 'react';

export default function CollapsableSection({children, changeVar, title, collapseStates, prop, initExpanded}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [height, setHeight] = React.useState(0);
  const [transitionAllowed, setTransitionAllowed] = React.useState(null);
  const childRef = React.useRef(null);

  React.useEffect(() => {
    setTimeout(() => {
      setHeight(childRef.current.children[0].clientHeight);
    });
  }, [changeVar]);

  React.useEffect(() => {
    setIsCollapsed(initExpanded ? false : collapseStates[prop]);
  }, [initExpanded]);

  const toggle = () => {
    if (transitionAllowed) clearTimeout(transitionAllowed);
    const timeout = setTimeout(() => setTransitionAllowed(null), 400);
    const newCollapseState = !isCollapsed;
    setTransitionAllowed(timeout);
    setIsCollapsed(newCollapseState);
    collapseStates[prop] = newCollapseState;
  };

  return (
    <div>
      <div className="playground-service-modal-collapsible-title" onClick={toggle}>
        <div className="playground-service-modal-collapsible-title-button">{isCollapsed ? '+' : '-'}</div>
        <span className="playground-service-modal-collapsible-title-text">{title}</span>
      </div>
      <div
        // The reason why transition is not always enabled is because if the child height is reduced - it will be quick,
        // however the parent maxHeight will take time to reduce to the required height - reproduce by removing code
        style={{maxHeight: isCollapsed ? '0px' : height, transition: transitionAllowed !== null ? '0.4s' : '0s'}}
        className="playground-service-modal-collapsible-child"
        ref={childRef}
      >
        {children}
      </div>
    </div>
  );
}
