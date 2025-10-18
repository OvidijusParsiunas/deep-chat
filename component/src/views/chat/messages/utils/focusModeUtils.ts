import {STYLE} from '../../../../utils/consts/htmlConstants';
import {FocusModeFade} from '../../../../types/focusMode';

export class FocusModeUtils {
  private static readonly DEFAULT_FADE_MS = 500;

  public static setFade(elementRef: HTMLElement, fade: FocusModeFade) {
    elementRef[STYLE].transitionDuration = typeof fade === 'number' ? `${fade}ms` : `${FocusModeUtils.DEFAULT_FADE_MS}ms`;
  }

  public static async fadeAnimation(elementRef: HTMLElement, fade: FocusModeFade) {
    elementRef[STYLE].opacity = '0';
    const timeoutMS = typeof fade === 'number' ? fade : FocusModeUtils.DEFAULT_FADE_MS;
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), timeoutMS);
    });
    elementRef[STYLE].opacity = '1';
  }
}
