import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {ButtonContainers, ButtonContainersT} from '../../buttonContainers/buttonContainers';
import {BUTTON_ORDER} from '../../../../../utils/buttons/inputButtons';
import {DropupStyles} from '../../../../../types/dropupStyles';
import {BUTTON_TYPES} from '../../../../../types/buttonTypes';
import {ButtonPosition} from '../../../../../types/button';
import {InputButton} from '../inputButton';
import {Dropup} from '../../dropup/dropup';

export type Positions = {[key in ButtonPosition]: ButtonProps[]};

type ButtonProps = {button: InputButton; buttonType?: BUTTON_TYPES; fileType?: FileAttachmentsType};

type Buttons = {
  [key in BUTTON_TYPES]?: ButtonProps;
};

export class InputButtonPositions {
  // prettier-ignore
  private static addToDropup(buttonContainers: ButtonContainersT, positions: Positions, containerElement: HTMLElement,
      dropupStyles?: DropupStyles) {
    const dropup = new Dropup(containerElement, dropupStyles);
    BUTTON_ORDER.forEach((buttonType) => {
      const index = positions['dropup-menu'].findIndex((props) => props.buttonType === buttonType);
      const buttonProps = positions['dropup-menu'][index];
      if (buttonProps) {
        dropup.addItem(buttonProps.button);
        positions['dropup-menu'].splice(index, 1);
      }
    });
    const position = Dropup.getPosition(positions, dropupStyles);
    ButtonContainers.addButton(buttonContainers, dropup.buttonContainer, position);
     // this is a quick workaround to get dropup recognised for InputButtonStyleAdjustments
    positions[position].push({} as ButtonProps);
  }

  private static addToSideContainer(buttonContainers: ButtonContainersT, positions: Positions) {
    const sideContainerPositions = ['inside-left', 'inside-right', 'outside-left', 'outside-right'];
    sideContainerPositions.forEach((sideContainerPosition) => {
      const position = sideContainerPosition as keyof Positions;
      positions[position].forEach((buttonProps) => {
        ButtonContainers.addButton(buttonContainers, buttonProps.button.elementRef, position);
      });
    });
  }

  private static setPosition(buttonsObj: Buttons, buttonType: keyof Buttons, positionButtons: ButtonProps[]) {
    const buttonProps = {...buttonsObj[buttonType], buttonType} as ButtonProps;
    positionButtons.push(buttonProps);
    delete buttonsObj[buttonType];
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
  private static generatePositions(buttonsObj: Buttons): Positions {
    const positions = InputButtonPositions.createPositionsObj();
    // REMEMBER THAT setPosition removes from buttonsObj
    // populate positions
    Object.keys(buttonsObj).forEach((key) => {
      const position = buttonsObj[key as keyof Buttons]?.button.position;
      if (position) InputButtonPositions.setPosition(buttonsObj, key as keyof Buttons, positions[position]);
    });
    // if nothing set to be on inside right and submit is not set -> place submit
    if (positions['inside-right'].length === 0 && buttonsObj.submit) {
      InputButtonPositions.setPosition(buttonsObj, 'submit', positions['inside-right']);
    }
    // if nothing set to be on outside right -> place submit/microphone/camera
    if (positions['outside-right'].length === 0) {
      if (buttonsObj.submit) {
        InputButtonPositions.setPosition(buttonsObj, 'submit', positions['outside-right']);
      } else if (buttonsObj.microphone) {
        InputButtonPositions.setPosition(buttonsObj, 'microphone', positions['outside-right']);
      } else if (buttonsObj.camera) {
        InputButtonPositions.setPosition(buttonsObj, 'camera', positions['outside-right']);
      }
    }
    // if submit still without a position - check if anything on outside-left - otherwise set outside-right
    if (buttonsObj.submit) {
      InputButtonPositions.setPosition(buttonsObj, 'submit',
        positions['outside-left'].length === 0 ? positions['outside-left'] : positions['inside-right']);
    }
    // if microphone still without a position - attempt outside-left - otherwise set outside-right
    if (buttonsObj.microphone) {
      InputButtonPositions.setPosition(buttonsObj, 'microphone',
        positions['outside-left'].length === 0 ? positions['outside-left'] : positions['inside-right']);
    }
    // if there are multiple buttons without a position -> dropdown
    const buttonsWithoutPositions = Object.keys(buttonsObj);
    if (buttonsWithoutPositions.length > 1 || positions['dropup-menu'].length > 0) {
      BUTTON_ORDER.forEach((buttonType) => {
        if (buttonsObj[buttonType]) positions['dropup-menu'].push({...buttonsObj[buttonType], buttonType} as ButtonProps);
      });
      // if there is one button without a position
    } else if (buttonsWithoutPositions.length === 1) {
      // if nothing on outside-right set it there - otherwise overwrite left
      InputButtonPositions.setPosition(buttonsObj, buttonsWithoutPositions[0] as keyof Buttons,
        positions['outside-right'].length === 0 ? positions['outside-right'] : positions['outside-left']);
    }
    return positions;
  }

  // prettier-ignore
  public static addButtons(buttonContainers: ButtonContainersT, buttons: Buttons, container: HTMLElement,
      dropupStyles?: DropupStyles) {
    const positions = InputButtonPositions.generatePositions(buttons);
    InputButtonPositions.addToSideContainer(buttonContainers, positions);
    if (positions['dropup-menu'].length > 0) {
      InputButtonPositions.addToDropup(buttonContainers, positions, container, dropupStyles);
    }
    return positions;
  }
}
