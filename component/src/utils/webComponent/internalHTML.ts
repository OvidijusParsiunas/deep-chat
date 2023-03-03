import {AttributeTypeConverter} from '../../types/typeConverters';
import {GenericObject} from '../../types/object';

export class InternalHTML extends HTMLElement {
  _waitingToRender_ = false;
  _propUpdated_ = false;
  static _attributes_: GenericObject<AttributeTypeConverter> = {};
  static _attributeToProperty_: GenericObject<string> = {};

  static get observedAttributes() {
    return Object.keys(InternalHTML._attributes_) || [];
  }

  attributeChangedCallback(attributeName: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    const convertedValue = InternalHTML._attributes_[attributeName](newValue);
    const propertyName = InternalHTML._attributeToProperty_[attributeName];
    (this as unknown as GenericObject<unknown>)[propertyName] = convertedValue; // this will trigger the property decorator
  }

  onRender() {}
}
