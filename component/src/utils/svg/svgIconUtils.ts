export class SVGIconUtils {
  public static createSVGElement(svgString: string): SVGGraphicsElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    return doc.documentElement as unknown as SVGGraphicsElement;
  }
}
