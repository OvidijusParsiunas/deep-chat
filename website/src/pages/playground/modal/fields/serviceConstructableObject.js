import './serviceConstructableObject.css';
import React from 'react';

function add(properties, setProperties, changeCode) {
  setProperties([...properties, {keyName: '', value: ''}]);
  changeCode();
}

function AddButton({properties, setProperties, changeCode}) {
  return (
    <button
      className="playground-constructable-object-add-property"
      onClick={() => add(properties, setProperties, changeCode)}
    >
      Add
    </button>
  );
}

function remove(index, properties, setProperties, changeCode) {
  properties.splice(index, 1);
  setProperties([...properties]);
  setTimeout(() => changeCode());
}

function RemoveButton({index, properties, setProperties, changeCode}) {
  return <button onClick={() => remove(index, properties, setProperties, changeCode)}>R</button>;
}

function Field({index, property, properties, setProperties, changeCode}) {
  return (
    <div>
      <input
        type="string"
        className="playground-constructable-object-property-input"
        defaultValue={property.keyName}
        onChange={() => changeCode()}
      ></input>
      :
      <input
        type="string"
        className="playground-constructable-object-property-input"
        defaultValue={property.value}
        onChange={() => changeCode()}
      ></input>
      <RemoveButton index={index} properties={properties} setProperties={setProperties} changeCode={changeCode} />
    </div>
  );
}

export default function ConstructableObject({config, changeCode}) {
  const [properties, setProperties] = React.useState(
    Object.keys(config || []).map((property) => ({
      keyName: property,
      value: config[property],
    }))
  );

  return (
    <div className="playground-constructable-object">
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
