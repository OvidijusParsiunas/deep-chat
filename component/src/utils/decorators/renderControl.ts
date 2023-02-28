import {InternalHTML} from '../webComponent/internalHTML';

export class RenderControl {
  public static waitForPropertiesToBeUpdatedBeforeRender(aiAssistant: InternalHTML) {
    aiAssistant._propUpdated_ = false;
    setTimeout(() => {
      if (!aiAssistant._propUpdated_) {
        aiAssistant._waitingToRender_ = false;
        aiAssistant.onRender();
      } else {
        RenderControl.waitForPropertiesToBeUpdatedBeforeRender(aiAssistant);
      }
    });
  }

  public static attemptRender(aiAssistant: InternalHTML) {
    aiAssistant._propUpdated_ = true;
    if (!aiAssistant._waitingToRender_) {
      aiAssistant._waitingToRender_ = true;
      RenderControl.waitForPropertiesToBeUpdatedBeforeRender(aiAssistant);
    }
  }
}
