import React from 'react';
import './options.css';

export default function Options(props) {
  const [initialDisplay, setInitialDisplay] = React.useState(false);
  const [hoverTransition, setHoverTransition] = React.useState(false);
  const [leaveTransition, setLeaveTransition] = React.useState(false);
  const [quickEntryTransition, setQuickEntryTransition] = React.useState(false);

  React.useEffect(() => {
    if (props.quickEntryTransition) {
      quickEntrance();
    } else {
      slowEntrance();
    }
  }, []);

  const quickEntrance = () => {
    setTimeout(() => {
      setInitialDisplay(true);
      setQuickEntryTransition(true);
      setTimeout(() => {
        setHoverTransition(true);
        setQuickEntryTransition(false);
      }, 1000);
    }, 10);
  };

  const slowEntrance = () => {
    setTimeout(() => {
      setInitialDisplay(true);
      setTimeout(() => {
        setHoverTransition(true);
      }, 1000);
    }, 1500);
  };

  const setOptionNumber = (setOptionNumber, optionNumber) => {
    setInitialDisplay(false);
    setHoverTransition(false);
    setLeaveTransition(true);
    setTimeout(() => {
      setOptionNumber(optionNumber);
    }, 800);
  };

  return (
    <div
      id="start-page-options"
      className={`${initialDisplay ? 'start-page-options-visible' : ''}
    ${hoverTransition ? 'start-page-options-hoverable' : ''}
    ${leaveTransition ? 'start-page-options-leave' : ''}
    ${quickEntryTransition ? 'start-page-options-quick-entry' : ''}`}
    >
      {' '}
      {props.options?.map((option, index) => (
        <div key={index} className={`start-page-text-option-container start-page-text-option-container-${index + 1}`}>
          {option.link ? (
            <a href={option.link} target="_blank" className={`start-page-text ${option.className || ''}`}>
              {option.text}
            </a>
          ) : (
            <div
              className={`start-page-text ${option.className || ''}`}
              onClick={() => setOptionNumber(props.setOptionNumber, option.number)}
            >
              {option.text}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
