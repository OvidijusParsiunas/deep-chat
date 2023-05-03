import {FileAttachmentsType} from '../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {BUTTON_ORDER} from '../../../../utils/buttons/inputButtons';
import {BUTTON_TYPES} from '../../../../types/buttonTypes';
import {ButtonPosition} from '../../../../types/button';
import {ButtonStyling} from './buttonStyling';

type Positions = {[key in ButtonPosition]: ButtonProps[]};

type ButtonProps = {button: ButtonStyling; fileType?: FileAttachmentsType};

type Buttons = {
  [key in BUTTON_TYPES]?: ButtonProps;
};

export class ButtonPositions {
  private static setPosition(buttonsObj: Buttons, buttonName: keyof Buttons, positionButtons: ButtonProps[]) {
    const buttonProps = buttonsObj[buttonName] as ButtonProps;
    positionButtons.push(buttonProps);
    delete buttonsObj[buttonName];
  }

  private static createPositionsObj(): Positions {
    return {
      'dropup-menu': [],
      'outside-left': [],
      'inside-left': [],
      'inside-right': [],
      'outside-right': [],
    };
  }

  // prettier-ignore
  public static generatePositions(buttonsObj: Buttons): Positions {
    const positions = ButtonPositions.createPositionsObj();
    // REMEMBER THAT setPosition removes from buttonsObj
    // populate positions
    Object.keys(buttonsObj).forEach((key) => {
      const position = buttonsObj[key as keyof Buttons]?.button.position;
      if (position) ButtonPositions.setPosition(buttonsObj, key as keyof Buttons, positions[position]);
    });
    // if nothing set to be on inside right and submit is not set -> place submit
    if (positions['inside-right'].length === 0 && buttonsObj.submit) {
      ButtonPositions.setPosition(buttonsObj, 'submit', positions['inside-right']);
    }
    // if nothing set to be on outside right -> place submit/microphone/camera
    if (positions['outside-right'].length === 0) {
      if (buttonsObj.submit) {
        ButtonPositions.setPosition(buttonsObj, 'submit', positions['outside-right']);
      } else if (buttonsObj.microphone) {
        ButtonPositions.setPosition(buttonsObj, 'microphone', positions['outside-right']);
      } else if (buttonsObj.camera) {
        ButtonPositions.setPosition(buttonsObj, 'camera', positions['outside-right']);
      }
    }
    // if submit still without a position - check if anything on outside-left - otherwise set outside-right
    if (buttonsObj.submit) {
      ButtonPositions.setPosition(buttonsObj, 'submit',
        positions['outside-left'].length === 0 ? positions['outside-left'] : positions['inside-right']);
    }
    // if microphone still without a position - attempt outside-left - otherwise set outside-right
    if (buttonsObj.microphone) {
      ButtonPositions.setPosition(buttonsObj, 'microphone',
        positions['outside-left'].length === 0 ? positions['outside-left'] : positions['inside-right']);
    }
    // if there are multiple buttons without a position -> dropdown
    const buttonsWithoutPositions = Object.keys(buttonsObj);
    if (buttonsWithoutPositions.length > 1) {
      BUTTON_ORDER.forEach((buttonType) => {
        if (buttonsObj[buttonType]) positions['dropup-menu'].push(buttonsObj[buttonType] as ButtonProps);
      });
      // if there is one button without a position
    } else if (buttonsWithoutPositions.length === 1) {
      // if nothing on outside-right set it there - otherwise overwrite left
      ButtonPositions.setPosition(buttonsObj, buttonsWithoutPositions[0] as keyof Buttons,
        positions['outside-right'].length === 0 ? positions['outside-right'] : positions['outside-left']);
    }
    return positions;
  }
}
