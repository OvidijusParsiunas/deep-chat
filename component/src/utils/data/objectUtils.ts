export class ObjectUtils {
  public static setPropertyValueIfDoesNotExist<T>(object: T, keys: string[], value: unknown) {
    const propertyKey = keys[0] as keyof T;
    if (keys.length === 1) {
      object[propertyKey] ??= value as T[keyof T];
    } else {
      object[propertyKey] ??= {} as T[keyof T];
      keys.shift();
      ObjectUtils.setPropertyValueIfDoesNotExist(object[propertyKey], keys, value);
    }
  }
}
