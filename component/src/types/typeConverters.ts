export type AvailableTypes = 'string' | 'number' | 'boolean' | 'object';

export type AttributeTypeConverter = (value: string) => unknown;

export type AttributeTypeConverters = {[key in AvailableTypes]: AttributeTypeConverter};
