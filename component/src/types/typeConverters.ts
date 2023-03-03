export type AvailableTypes = 'string' | 'number' | 'boolean' | 'object' | 'function';

export type AttributeTypeConverter = (value: string) => unknown;

export type AttributeTypeConverters = {[key in AvailableTypes]: AttributeTypeConverter};
