import {AttributeTypeConverter, AvailableTypes} from '../../types/typeConverters';
import {GenericObject} from '../../types/object';
import {TypeConverters} from './typeConverters';
import {AiAssistant} from '../../aiAssistant';
import {RenderControl} from './renderControl';

// _attributes_ and _attributeToProperty_ exist as static props as Property is called only once for each field (below)
type InternalHTML = {
  _attributes_: GenericObject<AttributeTypeConverter>;
  _attributeToProperty_: GenericObject<string>;
};

// IMPORTANT - these are called ONCE for each property and for multiple component instances
// used to monitor property changes and automatically view them as attributes
export function Property(type: AvailableTypes) {
  // WORK - try to refactor this somehow that it is activated for environments that need this.
  return function (target: Object, propertyKey: string) {
    let value: string;
    const getter = function () {
      return value;
    };
    const setter = function (this: AiAssistant, newVal: string) {
      value = newVal;
      RenderControl.attemptRender(this);
    };
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
    });
    // using constructor and not static object in order to not reinstantiate and register the element twice
    const internalHTML = target.constructor as unknown as InternalHTML;
    const attributeName = propertyKey.toLocaleLowerCase();
    internalHTML._attributes_[attributeName] = TypeConverters.attibutes[type];
    internalHTML._attributeToProperty_[attributeName] = propertyKey;
  };
}

// for any future refactoring:
// Note the IMPORTANT message above
// Property is called before any constructors
// the target: Object is an instance of InternalHTML and what it is extending it, however the fields defined
// in those classes do not exist when Property is called and their values should not be used as they will
// be overwritten by the field definitions when constructor is called. Alternatively create new fields
// from Property and they will later be present in the class.
