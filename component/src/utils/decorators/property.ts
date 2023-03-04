import {AttributeTypeConverter, AvailableTypes} from '../../types/typeConverters';
import {GenericObject} from '../../types/object';
import {TypeConverters} from './typeConverters';
import {RenderControl} from './renderControl';
import {AiAssistant} from '../../aiAssistant';

// _attributes_ and _attributeToProperty_ exist as static props and need it here as a class instance type
type InternalHTML = {
  _attributes_: GenericObject<AttributeTypeConverter>;
  _attributeToProperty_: GenericObject<string>;
};

// used to monitor property changes and automatically view them as attributes
export function Property(type: AvailableTypes) {
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
