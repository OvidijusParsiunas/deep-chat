export type CustomStyle = Partial<CSSStyleDeclaration>;

export interface StatefulStyle {
  default?: CustomStyle;
  hover?: CustomStyle;
  click?: CustomStyle;
}
