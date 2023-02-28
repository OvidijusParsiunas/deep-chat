import {AttributeTypeConverter, AvailableTypes} from '../../types/typeConverters';
import {GenericObject} from '../../types/object';
import {TypeConverters} from './typeConverters';
import {RenderControl} from './renderControl';
import {AiAssistant} from '../../AIAssistant';

// _attributes_ exists as a static prop and need it here as an instance
type InternalHTMLInstance = {_attributes_: GenericObject<AttributeTypeConverter>};

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
    (target.constructor as unknown as InternalHTMLInstance)._attributes_[propertyKey] = TypeConverters.attibutes[type];
  };
}
