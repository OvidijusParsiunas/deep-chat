import './collapsableSection.css';
import React from 'react';

const TRANSITION_LENGTH_MS = 400;

export default function CollapsableSection({children, title, collapseStates, prop, initExpanded}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false); // set in a different state in order to allow transition animation to activate
  const [maxHeight, setMaxHeight] = React.useState(0);
  const [isTransitionAllowed, setIsTransitionAllowed] = React.useState(null);
  const [activeTimeout, setActiveTimeout] = React.useState(null);
  const childRef = React.useRef(null);

  React.useEffect(() => {
    const newCollapseState = initExpanded ? false : collapseStates[prop];
    setIsCollapsed(newCollapseState);
    setIsHidden(newCollapseState);
    setMaxHeight('unset');
  }, [initExpanded]);

  const toggle = () => {
    if (isTransitionAllowed) clearTimeout(isTransitionAllowed);
    const timeout = setTimeout(() => setIsTransitionAllowed(null), TRANSITION_LENGTH_MS);
    const newCollapseState = !isCollapsed;
    setMaxHeight(childRef.current.children[0].clientHeight);
    // in a timeout to allow maxHeight to be set for the transition animation to occur - test by collapsing the section
    if (activeTimeout) clearTimeout(activeTimeout);
    setTimeout(() => {
      setIsHidden(true);
      setIsTransitionAllowed(timeout);
      setIsCollapsed(newCollapseState);
      collapseStates[prop] = newCollapseState;
      if (!newCollapseState) {
        const timeout = setTimeout(() => {
          setIsHidden(false);
          // the reason why maxHeight is unset is because dropdown menus would not have room to display and constructable form
          // will not change the height
          setMaxHeight('unset');
          setActiveTimeout(null);
        }, TRANSITION_LENGTH_MS);
        setActiveTimeout(timeout);
      }
    });
  };

  return (
    <div>
      <div className="playground-service-modal-collapsible-title">
        <div className="playground-service-modal-collapsible-title-button" onClick={toggle}>
          {isCollapsed ? '+' : '-'}
        </div>
        <span className="playground-service-modal-collapsible-title-text" onClick={toggle}>
          {title}
        </span>
      </div>
      <div
        // The reason why transition is not always enabled is because if the height is reduced - the parent maxHeight
        // will take time to reach the new height and animation will look delayed - reproduce by removing code
        style={{
          overflow: isHidden ? 'hidden' : 'unset',
          maxHeight: isCollapsed ? '0px' : maxHeight,
          transition: isTransitionAllowed !== null ? '0.4s' : '0s',
        }}
        ref={childRef}
      >
        {children}
      </div>
    </div>
  );
}
