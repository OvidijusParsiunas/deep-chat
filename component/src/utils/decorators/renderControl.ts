import {InternalHTML} from '../webComponent/internalHTML';

export class RenderControl {
  private static waitForPropertiesToBeUpdatedBeforeRender(deepChat: InternalHTML) {
    deepChat._propUpdated_ = false;
    setTimeout(() => {
      if (!deepChat._propUpdated_) {
        deepChat._waitingToRender_ = false;
        deepChat.onRender();
      } else {
        RenderControl.waitForPropertiesToBeUpdatedBeforeRender(deepChat);
      }
    });
  }

  public static attemptRender(deepChat: InternalHTML) {
    deepChat._propUpdated_ = true;
    if (!deepChat._waitingToRender_) {
      deepChat._waitingToRender_ = true;
      RenderControl.waitForPropertiesToBeUpdatedBeforeRender(deepChat);
    }
  }
}
