export class Browser {
  public static readonly IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
