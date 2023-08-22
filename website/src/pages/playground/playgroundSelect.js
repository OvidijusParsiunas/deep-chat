import Select from 'react-select';
import React from 'react';

function changeFirstLetter(text, capitalize = true) {
  return text.charAt(0)[capitalize ? 'toUpperCase' : 'toLowerCase']() + text.slice(1);
}

function processText(text, pseudoNames) {
  return pseudoNames?.[text] || changeFirstLetter(text);
}

function constructOption(optionText, pseudoNames) {
  return {value: optionText, text: processText(optionText, pseudoNames)};
}

export default function PlaygroundSelect({options, defaultOption, onChange, passValueToChange, pseudoNames, isImages}) {
  const [activeOption, setActiveOption] = React.useState(null);

  React.useEffect(() => {
    isImages ? setActiveOption(defaultOption) : setActiveOption(constructOption(defaultOption, pseudoNames));
  }, [defaultOption]);

  return (
    <Select
      isSearchable={false}
      value={activeOption}
      className="playground-select"
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          width: '200px',
          padding: '0px',
          minHeight: '10px',
          border: '1px solid grey',
          fontSize: '15px',
        }),
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
        menu: (baseStyles) => ({
          ...baseStyles,
          width: '200px',
        }),
        option: (baseStyles, {isSelected, isFocused}) => ({
          ...baseStyles,
          margin: '0px',
          padding: '0px',
          paddingTop: '1px',
          paddingBottom: '0.5px',
          fontSize: '15px',
          backgroundColor: isSelected ? '#c9e2ff' : isFocused ? '#e0eeff' : baseStyles.backgroundColor,
          color: isSelected ? 'black' : baseStyles.color,
        }),
        indicatorSeparator: (baseStyles) => ({
          ...baseStyles,
          display: 'none',
        }),
      }}
      options={isImages ? options : options.map((type) => constructOption(type, pseudoNames))}
      onChange={(event) => {
        if (passValueToChange === undefined || passValueToChange) {
          onChange(event.value);
        } else {
          setActiveOption(constructOption(event.value, pseudoNames));
          onChange?.();
        }
      }}
      getOptionLabel={(e) => (
        <div style={{display: 'flex', alignItems: 'center', paddingLeft: isImages ? '6px' : '4px'}}>
          {e.icon}
          {e.text === '' ? (
            <span style={{marginTop: '-2px'}}>&nbsp;</span>
          ) : (
            <span style={{marginLeft: isImages ? '6px' : '', marginTop: '-2px'}}>{e.text}</span>
          )}
        </div>
      )}
    />
  );
}
