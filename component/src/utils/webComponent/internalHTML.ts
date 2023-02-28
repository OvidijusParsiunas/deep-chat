import {GenericObject} from '../../types/object';

export class InternalHTML extends HTMLElement {
  _waitingToRender_ = false;
  _propUpdated_ = false;
  static _watchableProps_: GenericObject<null> = {};

  static get observedAttributes() {
    return Object.keys(this._watchableProps_) || [];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    (this as unknown as GenericObject<string>)[name] = newValue; // this will trigger the decorator
  }

  onRender() {}
}
