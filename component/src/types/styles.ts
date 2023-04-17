export type CustomStyle = Partial<CSSStyleDeclaration>;

export interface StatefulStyles {
  default?: CustomStyle;
  hover?: CustomStyle;
  click?: CustomStyle;
}
