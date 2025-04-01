import {CustomDropupItemStyles} from '../../../../../types/customButton';
import {ObjectUtils} from '../../../../../utils/data/objectUtils';
import {StatefulStyles} from '../../../../../types/styles';

export type CustomButtonDropupStyles = Pick<CustomDropupItemStyles, 'default' | 'active' | 'disabled'>;

export class CustomButtonDropupStyle {
  private static applyCustomStylesToDefault(defStyles: CustomButtonDropupStyles, customStyles: CustomDropupItemStyles) {
    const states = ['default', 'hover', 'click'];
    for (const state of states as Array<keyof CustomButtonDropupStyles>) {
      defStyles[state] = {item: {}};
      if (defStyles[state].item) {
        for (const mouseState of states as Array<keyof Required<StatefulStyles>>) {
          ObjectUtils.assignPropertyFromOneToAnother(mouseState, defStyles[state].item, customStyles[state]?.item);
        }
      }
      ObjectUtils.assignPropertyFromOneToAnother('iconContainer', defStyles[state], customStyles[state]);
      ObjectUtils.assignPropertyFromOneToAnother('text', defStyles[state], customStyles[state]);
    }
  }

  public static createDropupStyles(customStyles: CustomDropupItemStyles = {}) {
    CustomButtonDropupStyle.applyCustomStylesToDefault({}, customStyles);
    return customStyles;
  }
}
