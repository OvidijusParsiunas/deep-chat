import {GenericObject} from '../../types/object';
import {RenderControl} from './renderControl';
import {AiAssistant} from '../../AIAssistant';

// _watchableProps_ exists as a static prop and need it as an instance
type InternalHTMLInstance = {_watchableProps_: GenericObject<null>};

export function Property() {
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
    (target.constructor as unknown as InternalHTMLInstance)._watchableProps_[propertyKey] = null;
  };
}
