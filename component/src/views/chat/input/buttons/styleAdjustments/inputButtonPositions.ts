import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {ButtonContainers, ButtonContainersT} from '../../buttonContainers/buttonContainers';
import {CAMERA, MICROPHONE} from '../../../../../utils/consts/messageConstants';
import {BUTTON_ORDER} from '../../../../../utils/buttons/inputButtons';
import {DropupStyles} from '../../../../../types/dropupStyles';
import {BUTTON_TYPE} from '../../../../../types/buttonTypes';
import {ButtonPosition} from '../../../../../types/button';
import {CustomButton} from '../custom/customButton';
import {InputButton} from '../inputButton';
import {Dropup} from '../../dropup/dropup';
import {
  OUTSIDE_RIGHT,
  INSIDE_RIGHT,
  OUTSIDE_LEFT,
  DROPUP_MENU,
  INSIDE_LEFT,
} from '../../../../../utils/consts/inputConstants';

export type PositionToButtons = {[key in ButtonPosition]: ButtonProps[]};

type ButtonProps = {button: InputButton; buttonType?: BUTTON_TYPE; fileType?: FileAttachmentsType};

type Buttons = {
  [key in BUTTON_TYPE]?: ButtonProps;
};

export class InputButtonPositions {
  // prettier-ignore
  private static addToDropup(buttonContainers: ButtonContainersT, pToBs: PositionToButtons,
      containerElement: HTMLElement, dropupStyles?: DropupStyles) {
    const dropup = new Dropup(containerElement, dropupStyles);
    BUTTON_ORDER.forEach((buttonType) => {
      const index = pToBs[DROPUP_MENU].findIndex((props) => props.buttonType === buttonType);
      const buttonProps = pToBs[DROPUP_MENU][index];
      if (buttonProps) {
        dropup.addItem(buttonProps.button);
        pToBs[DROPUP_MENU].splice(index, 1);
      }
    });
    pToBs[DROPUP_MENU].forEach(({button}) => dropup.addItem(button));
    const position = Dropup.getPosition(pToBs, dropupStyles);
    ButtonContainers.addButton(buttonContainers, dropup.buttonContainer, position);
     // this is a quick workaround to get dropup recognised for InputButtonStyleAdjustments
    pToBs[position].push({} as ButtonProps);
  }

  private static addToSideContainer(buttonContainers: ButtonContainersT, pToBs: PositionToButtons) {
    const sideContainerPositions = [INSIDE_LEFT, INSIDE_RIGHT, OUTSIDE_LEFT, OUTSIDE_RIGHT];
    sideContainerPositions.forEach((sideContainerPosition) => {
      const position = sideContainerPosition as keyof PositionToButtons;
      pToBs[position].forEach((buttonProps) => {
        ButtonContainers.addButton(buttonContainers, buttonProps.button.elementRef, position);
      });
    });
  }

  private static setPosition(buttonsObj: Buttons, buttonType: keyof Buttons, positionButtons: ButtonProps[]) {
    const buttonProps = {...buttonsObj[buttonType], buttonType} as ButtonProps;
    positionButtons.push(buttonProps);
    delete buttonsObj[buttonType];
  }

  private static createPositionsToButtonsObj(): PositionToButtons {
    return {
      [DROPUP_MENU]: [],
      [OUTSIDE_LEFT]: [],
      [INSIDE_LEFT]: [],
      [INSIDE_RIGHT]: [],
      [OUTSIDE_RIGHT]: [],
    };
  }

  // prettier-ignore
  private static generatePositionToButtons(buttonsObj: Buttons): PositionToButtons {
    const pToBs = InputButtonPositions.createPositionsToButtonsObj();
    // REMEMBER THAT setPosition removes from buttonsObj
    // populate positions
    Object.keys(buttonsObj).forEach((key) => {
      const position = buttonsObj[key as keyof Buttons]?.button.position;
      if (position) InputButtonPositions.setPosition(buttonsObj, key as keyof Buttons, pToBs[position]);
    });
    // if nothing set to be on inside right and submit is not set -> place submit
    if (pToBs[INSIDE_RIGHT].length === 0 && buttonsObj.submit) {
      InputButtonPositions.setPosition(buttonsObj, 'submit', pToBs[INSIDE_RIGHT]);
    }
    // if nothing set to be on outside right -> place submit/microphone/camera
    if (pToBs[OUTSIDE_RIGHT].length === 0) {
      if (buttonsObj.submit) {
        InputButtonPositions.setPosition(buttonsObj, 'submit', pToBs[OUTSIDE_RIGHT]);
      } else if (buttonsObj.microphone) {
        InputButtonPositions.setPosition(buttonsObj, MICROPHONE, pToBs[OUTSIDE_RIGHT]);
      } else if (buttonsObj.camera) {
        InputButtonPositions.setPosition(buttonsObj, CAMERA, pToBs[OUTSIDE_RIGHT]);
      } else if (buttonsObj[`${CustomButton.INDICATOR_PREFIX}1`]) {
        InputButtonPositions.setPosition(buttonsObj, `${CustomButton.INDICATOR_PREFIX}1`, pToBs[OUTSIDE_RIGHT]);
      }
    }
    // if submit still without a position - check if anything on outside-left - otherwise set outside-right
    if (buttonsObj.submit) {
      InputButtonPositions.setPosition(buttonsObj, 'submit',
        pToBs[OUTSIDE_LEFT].length === 0 ? pToBs[OUTSIDE_LEFT] : pToBs[INSIDE_RIGHT]);
    }
    // if microphone still without a position - attempt outside-left - otherwise set outside-right
    if (buttonsObj.microphone) {
      InputButtonPositions.setPosition(buttonsObj, MICROPHONE,
        pToBs[OUTSIDE_LEFT].length === 0 ? pToBs[OUTSIDE_LEFT] : pToBs[INSIDE_RIGHT]);
    }
    // if there are multiple buttons without a position -> dropdown
    const buttonsWithoutPositions = Object.keys(buttonsObj);
    if (buttonsWithoutPositions.length > 1 || pToBs[DROPUP_MENU].length > 0) {
      BUTTON_ORDER.forEach((buttonType) => {
        if (buttonsObj[buttonType]) pToBs[DROPUP_MENU].push({...buttonsObj[buttonType], buttonType} as ButtonProps);
      });
      // custom buttons are added at the bottom
      buttonsWithoutPositions.forEach((buttonType) => {
        const customType = buttonType as `custom${number}`;
        if (customType.startsWith(CustomButton.INDICATOR_PREFIX) && buttonsObj[customType]) {
          pToBs[DROPUP_MENU].push({...buttonsObj[customType], customType} as ButtonProps);
        }
      });
      // if there is one button without a position
    } else if (buttonsWithoutPositions.length === 1) {
      // if nothing on outside-right set it there - otherwise overwrite left
      InputButtonPositions.setPosition(buttonsObj, buttonsWithoutPositions[0] as keyof Buttons,
        pToBs[OUTSIDE_RIGHT].length === 0 ? pToBs[OUTSIDE_RIGHT] : pToBs[OUTSIDE_LEFT]);
    }
    return pToBs;
  }

  // prettier-ignore
  public static addButtons(buttonContainers: ButtonContainersT, buttons: Buttons, container: HTMLElement,
      dropupStyles?: DropupStyles) {
    const pToBs = InputButtonPositions.generatePositionToButtons(buttons);
    InputButtonPositions.addToSideContainer(buttonContainers, pToBs);
    if (pToBs[DROPUP_MENU].length > 0) {
      InputButtonPositions.addToDropup(buttonContainers, pToBs, container, dropupStyles);
    }
    return pToBs;
  }
}
