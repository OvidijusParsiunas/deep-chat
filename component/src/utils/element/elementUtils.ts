export class ElementUtils {
  public static addElements(parent: HTMLElement, ...elements: HTMLElement[]) {
    elements.forEach((element) => parent.appendChild(element));
  }
}
