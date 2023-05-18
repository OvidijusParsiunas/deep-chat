import {AttributeTypeConverter, AvailableTypes} from '../../types/typeConverters';
import {GenericObject} from '../../types/object';
import {TypeConverters} from './typeConverters';

// _attributes_ and _attributeToProperty_ exist as static props as Property is called only once for each field (below)
type InternalHTML = {
  _attributes_: GenericObject<AttributeTypeConverter>;
  _attributeToProperty_: GenericObject<string>;
};

// IMPORTANT - these are called ONCE for each property and for multiple component instances
// used to monitor property changes and automatically view them as attributes
export function Property(type: AvailableTypes) {
  return function (target: Object, propertyKey: string) {
    // this is primarily used for the react wrapper to infer properties, but can be put inside a condition
    // if it is causing issues for other frameworks
    Object.defineProperty(target, propertyKey, {});
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
