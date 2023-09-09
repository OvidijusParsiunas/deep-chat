import './serviceConstructableObject.css';
import React from 'react';

function add(properties, setProperties, changeCode) {
  setProperties([...properties, {keyName: '', value: ''}]);
  changeCode();
}

function AddButton({properties, setProperties, changeCode}) {
  return (
    <button
      id="playground-constructable-object-add-button"
      className="playground-constructable-object-button playground-constructable-object-add-button"
      onClick={() => add(properties, setProperties, changeCode)}
    >
      +
    </button>
  );
}

function remove(index, properties, setProperties, changeCode) {
  properties.splice(index, 1);
  setTimeout(() => {
    // for some reason setProperties needs to be in a timeout and does not refresh html unless we set it with [] first
    setProperties([]);
    setProperties([...properties]);
    changeCode();
  });
}

function RemoveButton({index, properties, setProperties, changeCode}) {
  return (
    <button
      id="playground-constructable-object-remove-button"
      className="playground-constructable-object-button playground-constructable-object-remove-button"
      onClick={() => remove(index, properties, setProperties, changeCode)}
    >
      -
    </button>
  );
}

function Field({index, property, properties, setProperties, changeCode}) {
  const [keyName, setKeyName] = React.useState(property.keyName);
  const [value, setValue] = React.useState(property.value);
  return (
    <div>
      <input
        type="string"
        style={{marginRight: '2px'}}
        className="playground-constructable-object-property-input"
        value={keyName}
        onChange={(event) => {
          property.keyName = event.target.value;
          setKeyName(property.keyName);
          changeCode();
        }}
      ></input>
      :
      <input
        type="string"
        style={{marginLeft: '2px'}}
        className="playground-constructable-object-property-input"
        value={value}
        onChange={(event) => {
          property.value = event.target.value;
          setValue(property.value);
          changeCode();
        }}
      ></input>
      <RemoveButton index={index} properties={properties} setProperties={setProperties} changeCode={changeCode} />
    </div>
  );
}

export default function ConstructableObject({configVal, changeCode}) {
  const [properties, setProperties] = React.useState(
    Object.keys(configVal || []).map((property) => ({
      keyName: property,
      value: configVal[property],
    }))
  );

  return (
    // class is also used for extraction
    <div className="playgroud-service-modal-form">
      {properties.map((property, index) => (
        <Field
          key={index}
          index={index}
          property={property}
          properties={properties}
          setProperties={setProperties}
          changeCode={changeCode}
        />
      ))}
      <AddButton properties={properties} setProperties={setProperties} changeCode={changeCode} />
    </div>
  );
}
