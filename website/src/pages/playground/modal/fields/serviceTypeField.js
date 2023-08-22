import PlaygroundSelect from '../../playgroundSelect';
import React from 'react';

export default function ServiceType({availableTypes, activeType, changeType, pseudoNames}) {
  return (
    <div>
      <div className="playground-service-modal-input-label">Type:</div>
      <PlaygroundSelect
        options={availableTypes}
        defaultOption={activeType}
        onChange={changeType}
        pseudoNames={pseudoNames}
      />
    </div>
  );
}
