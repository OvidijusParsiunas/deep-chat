export class RemarkableUtils {
  // this is to allow remarkable to render \n as a new line:
  // it operates by replacing \n with \n\n
  public static replaceNewlineWithDouble(str: string) {
    return str.replace(/(?<!\n)\n(?!\n)/g, '\n\n');
  }
}
