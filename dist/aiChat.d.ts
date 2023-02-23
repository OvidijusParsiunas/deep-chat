export declare class AiChat extends HTMLElement {
    _containerRef: HTMLElement;
    constructor();
    get key(): string;
    set key(newValue: string);
    static get observedAttributes(): string[];
    attributeChangedCallback(property: string, oldValue: string, newValue: string): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'ai-chat': AiChat;
    }
}
//# sourceMappingURL=aiChat.d.ts.map