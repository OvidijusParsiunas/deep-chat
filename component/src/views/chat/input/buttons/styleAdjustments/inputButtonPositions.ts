import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {ButtonContainers, ButtonContainersT} from '../../buttonContainers/buttonContainers';
import {BUTTON_ORDER} from '../../../../../utils/buttons/inputButtons';
import {DropupStyles} from '../../../../../types/dropupStyles';
import {BUTTON_TYPE} from '../../../../../types/buttonTypes';
import {ButtonPosition} from '../../../../../types/button';
import {InputButton} from '../inputButton';
import {Dropup} from '../../dropup/dropup';

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
      const index = pToBs['dropup-menu'].findIndex((props) => props.buttonType === buttonType);
      const buttonProps = pToBs['dropup-menu'][index];
      if (buttonProps) {
        dropup.addItem(buttonProps.button);
        pToBs['dropup-menu'].splice(index, 1);
      }
    });
    const position = Dropup.getPosition(pToBs, dropupStyles);
    ButtonContainers.addButton(buttonContainers, dropup.buttonContainer, position);
     // this is a quick workaround to get dropup recognised for InputButtonStyleAdjustments
    pToBs[position].push({} as ButtonProps);
  }

  private static addToSideContainer(buttonContainers: ButtonContainersT, pToBs: PositionToButtons) {
    const sideContainerPositions = ['inside-left', 'inside-right', 'outside-left', 'outside-right'];
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
      'dropup-menu': [],
      'outside-left': [],
      'inside-left': [],
      'inside-right': [],
      'outside-right': [],
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
    if (pToBs['inside-right'].length === 0 && buttonsObj.submit) {
      InputButtonPositions.setPosition(buttonsObj, 'submit', pToBs['inside-right']);
    }
    // if nothing set to be on outside right -> place submit/microphone/camera
    if (pToBs['outside-right'].length === 0) {
      if (buttonsObj.submit) {
        InputButtonPositions.setPosition(buttonsObj, 'submit', pToBs['outside-right']);
      } else if (buttonsObj.microphone) {
        InputButtonPositions.setPosition(buttonsObj, 'microphone', pToBs['outside-right']);
      } else if (buttonsObj.camera) {
        InputButtonPositions.setPosition(buttonsObj, 'camera', pToBs['outside-right']);
      }
    }
    // if submit still without a position - check if anything on outside-left - otherwise set outside-right
    if (buttonsObj.submit) {
      InputButtonPositions.setPosition(buttonsObj, 'submit',
        pToBs['outside-left'].length === 0 ? pToBs['outside-left'] : pToBs['inside-right']);
    }
    // if microphone still without a position - attempt outside-left - otherwise set outside-right
    if (buttonsObj.microphone) {
      InputButtonPositions.setPosition(buttonsObj, 'microphone',
        pToBs['outside-left'].length === 0 ? pToBs['outside-left'] : pToBs['inside-right']);
    }
    // if there are multiple buttons without a position -> dropdown
    const buttonsWithoutPositions = Object.keys(buttonsObj);
    if (buttonsWithoutPositions.length > 1 || pToBs['dropup-menu'].length > 0) {
      BUTTON_ORDER.forEach((buttonType) => {
        if (buttonsObj[buttonType]) pToBs['dropup-menu'].push({...buttonsObj[buttonType], buttonType} as ButtonProps);
      });
      // if there is one button without a position
    } else if (buttonsWithoutPositions.length === 1) {
      // if nothing on outside-right set it there - otherwise overwrite left
      InputButtonPositions.setPosition(buttonsObj, buttonsWithoutPositions[0] as keyof Buttons,
        pToBs['outside-right'].length === 0 ? pToBs['outside-right'] : pToBs['outside-left']);
    }
    return pToBs;
  }

  // prettier-ignore
  public static addButtons(buttonContainers: ButtonContainersT, buttons: Buttons, container: HTMLElement,
      dropupStyles?: DropupStyles) {
    const pToBs = InputButtonPositions.generatePositionToButtons(buttons);
    InputButtonPositions.addToSideContainer(buttonContainers, pToBs);
    if (pToBs['dropup-menu'].length > 0) {
      InputButtonPositions.addToDropup(buttonContainers, pToBs, container, dropupStyles);
    }
    return pToBs;
  }
}
