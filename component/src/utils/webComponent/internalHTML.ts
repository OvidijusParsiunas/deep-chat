import {AttributeTypeConverter} from '../../types/typeConverters';
import {GenericObject} from '../../types/object';

export class InternalHTML extends HTMLElement {
  _waitingToRender_ = false;
  _propUpdated_ = false;
  static _attributes_: GenericObject<AttributeTypeConverter> = {};

  static get observedAttributes() {
    return Object.keys(this._attributes_) || [];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    const convertedValue = InternalHTML._attributes_[name](newValue);
    (this as unknown as GenericObject<unknown>)[name] = convertedValue; // this will trigger the property decorator
  }

  onRender() {}
}
