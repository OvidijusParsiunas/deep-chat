import {AttributeTypeConverter} from '../../types/typeConverters';
import {RenderControl} from '../decorators/renderControl';
import {GenericObject} from '../../types/object';

export class InternalHTML extends HTMLElement {
  _waitingToRender_ = false;
  _propUpdated_ = false;
  static _attributes_: GenericObject<AttributeTypeConverter> = {};
  static _attributeToProperty_: GenericObject<string> = {};

  static get observedAttributes() {
    return Object.keys(InternalHTML._attributes_) || [];
  }

  // If this is not working, try using propertyName directly
  constructor() {
    super();
    Object.keys(InternalHTML._attributeToProperty_).forEach((attributeName) => {
      const propertyName = InternalHTML._attributeToProperty_[attributeName];
      this.constructPropertyAccessors(propertyName);
      if (!this.hasOwnProperty(attributeName)) {
        // need to also set the lowercase version as a property for svelte
        this.constructPropertyAccessors(propertyName, attributeName);
      }
    });
  }

  // need to be called here as accessors need to be set for the class instance
  private constructPropertyAccessors(propertyKey: string, attributeName?: string) {
    let value: string;
    const getter = function () {
      return value;
    };
    const setter = function (this: InternalHTML, newVal: string) {
      value = newVal;
      if (attributeName) {
        // if the lower case version - assign the value to the actual property
        (this as unknown as GenericObject)[propertyKey] = newVal;
      } else {
        RenderControl.attemptRender(this);
      }
    };
    Object.defineProperty(this, attributeName || propertyKey, {
      get: getter,
      set: setter,
    });
  }

  attributeChangedCallback(attributeName: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    const convertedValue = InternalHTML._attributes_[attributeName](newValue);
    const propertyName = InternalHTML._attributeToProperty_[attributeName];
    (this as unknown as GenericObject<unknown>)[propertyName] = convertedValue; // this will trigger the property decorator
  }

  onRender() {}
}
