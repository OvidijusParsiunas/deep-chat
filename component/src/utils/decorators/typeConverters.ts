import {AttributeTypeConverters} from '../../types/typeConverters';

export class TypeConverters {
  public static readonly attibutes: AttributeTypeConverters = {
    string: (value: string) => value,
    number: (value: string) => parseFloat(value),
    boolean: (value: string) => value === 'true',
    object: (value: string) => JSON.parse(value),
    array: (value: string) => JSON.parse(value),
    function: (value: string) => new Function(`return ${value}`)(),
  };
}
