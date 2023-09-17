import {useColorMode} from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Select from 'react-select';
import './playgroundSelect.css';
import React from 'react';

function constructOption(optionText, pseudoNames) {
  return {value: optionText, text: pseudoNames?.[optionText] || optionText};
}

// prettier-ignore
export default function PlaygroundSelect(
    {options, defaultOption, onChange, passValueToChange, pseudoNames, isImages, modalRef}) {
  const [activeOption, setActiveOption] = React.useState(null);

  React.useEffect(() => {
    isImages ? setActiveOption(defaultOption) : setActiveOption(constructOption(defaultOption, pseudoNames));
  }, [defaultOption]);


  const commonOptions = isImages ? options : (options || []).map((type) => constructOption(type, pseudoNames))
  
  const commonOnChange = (e) => {
    if (passValueToChange === undefined || passValueToChange) {
      onChange(e.value);
    } else {
      setActiveOption(constructOption(e.value, pseudoNames));
      onChange?.();
    }
  }
  const commonOnMenuOpen = () => {
    // this is a fix for an issue where upon choosing service when there is no overflow (on start) - it creates an overflow
    // currently only a problem for the service selection
    // if no overflow - temporarily unset
    if (modalRef?.current && modalRef.current.scrollHeight <= modalRef.current.clientHeight) {
      modalRef.current.style.overflow = 'unset';
    }
  }

  const commonOnMenuClose = () => {
    if (modalRef?.current) {
      modalRef.current.style.overflow = 'auto';
    }
  }

  const commonGetOptionLabel = (e) => (
    <div
      className="playground-service-modal-select-option"
      style={{
        paddingLeft: isImages ? '6px' : '4px',
      }}
    >
      {e.icon}
      {e.text === '' ? (
        <span className="playground-service-modal-select-empty-option">&nbsp;</span>
      ) : (
        <span style={{marginLeft: isImages ? '6px' : '', marginTop: '-1px'}}>{e.text}</span>
      )}
    </div>
  )

  return (
    <BrowserOnly>
    {() => {
      const {colorMode} = useColorMode();
      if (colorMode === 'dark') {
        return (
          <Select
            isSearchable={false}
            value={activeOption}
            className="playground-select"
            styles={darkStyles}
            options={commonOptions}
            onChange={commonOnChange}
            onMenuOpen={commonOnMenuOpen}
            onMenuClose={commonOnMenuClose}
            getOptionLabel={commonGetOptionLabel}
          />
        );
      }
    
      return (
        <Select
          isSearchable={false}
          value={activeOption}
          className="playground-select"
          styles={lightStyles}
          options={commonOptions}
          onChange={commonOnChange}
          onMenuOpen={commonOnMenuOpen}
          onMenuClose={commonOnMenuClose}
          getOptionLabel={commonGetOptionLabel}
        />
      );
    }}
    </BrowserOnly>
  )
}

const sameStyles = {
  dropdownIndicator: (baseStyles) => ({
    ...baseStyles,
    margin: '0px',
    padding: '0px',
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    margin: '0px',
    padding: '0px',
    pointerEvents: 'none',
  }),
  valueContainer: (baseStyles) => ({
    ...baseStyles,
    margin: '0px',
    padding: '0px',
  }),
  indicatorSeparator: (baseStyles) => ({
    ...baseStyles,
    display: 'none',
  }),
};

const lightStyles = {
  ...sameStyles,
  control: (baseStyles) => ({
    ...baseStyles,
    width: '200px',
    padding: '0px',
    minHeight: '10px',
    border: '1px solid grey',
    fontSize: '15px',
    top: '1px',
    cursor: 'pointer',
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    width: '200px',
    marginTop: '5px',
  }),
  option: (baseStyles, {isSelected, isFocused}) => ({
    ...baseStyles,
    margin: '0px',
    padding: '0px',
    paddingTop: '1px',
    paddingBottom: '0.5px',
    cursor: 'pointer',
    fontSize: '15px',
    backgroundColor: isSelected ? '#c9e2ff' : isFocused ? '#e7f2ff' : baseStyles.backgroundColor,
    color: isSelected ? 'black' : baseStyles.color,
  }),
};

const darkStyles = {
  ...sameStyles,
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  control: (baseStyles) => ({
    ...baseStyles,
    width: '200px',
    padding: '0px',
    minHeight: '10px',
    border: '1px solid grey',
    fontSize: '15px',
    top: '1px',
    cursor: 'pointer',
    backgroundColor: '#3b3b3b',
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    width: '200px',
    marginTop: '5px',
    backgroundColor: '#3b3b3b',
  }),
  option: (baseStyles, {isSelected, isFocused}) => ({
    ...baseStyles,
    margin: '0px',
    padding: '0px',
    paddingTop: '1px',
    paddingBottom: '0.5px',
    cursor: 'pointer',
    fontSize: '15px',
    backgroundColor: isSelected ? '#636363' : isFocused ? '#727272' : baseStyles.backgroundColor,
    color: isSelected ? 'white' : baseStyles.color,
    ':active': {
      ...baseStyles[':active'],
      backgroundColor: '#616061',
    },
  }),
};
