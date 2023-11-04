export class ObjectUtils {
  public static setPropertyValueIfDoesNotExist<T>(object: T, nestedKeys: string[], value: unknown) {
    const propertyKey = nestedKeys[0] as keyof T;
    if (nestedKeys.length === 1) {
      object[propertyKey] ??= value as T[keyof T];
    } else {
      object[propertyKey] ??= {} as T[keyof T];
      nestedKeys.shift();
      ObjectUtils.setPropertyValueIfDoesNotExist(object[propertyKey], nestedKeys, value);
    }
  }

  public static setPropertyValue<T>(object: T, nestedKeys: string[], value: unknown) {
    const propertyKey = nestedKeys[0] as keyof T;
    if (nestedKeys.length === 1) {
      object[propertyKey] = value as T[keyof T];
    } else {
      object[propertyKey] ??= {} as T[keyof T];
      nestedKeys.shift();
      ObjectUtils.setPropertyValue(object[propertyKey], nestedKeys, value);
    }
  }

  public static getObjectValue<T>(object: T, nestedKeys: string[]): object | undefined {
    const propertyKey = nestedKeys[0] as keyof T;
    const currentValue = object[propertyKey];
    if (currentValue === undefined || nestedKeys.length === 1) {
      return currentValue as object | undefined;
    }
    return ObjectUtils.getObjectValue(currentValue, nestedKeys.slice(1));
  }

  public static overwritePropertyObjectFromAnother<T>(target: T, source: T, nestedKeys: string[]) {
    const sourceObject = ObjectUtils.getObjectValue(source, nestedKeys);
    if (sourceObject) {
      const newObject = {...sourceObject, ...(ObjectUtils.getObjectValue(target, nestedKeys) || {})};
      ObjectUtils.setPropertyValue(target, nestedKeys, newObject);
    }
  }
}
