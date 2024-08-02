import {Component} from "../base/component";
import {IEvents} from "../base/events";
import {ensureElement} from "../../utils/utils";
import {Events} from "../../types";

interface IModalData {
    content: HTMLElement;
}

export class Modal extends Component<IModalData> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this._content = ensureElement<HTMLElement>('.modal__content', container);

        this._closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', (event) => {
            if (event.target === this.container) {
                this.close();
            }
        });
        this._content.addEventListener('click', (event) => event.stopPropagation());
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.container.classList.contains('modal_active')) {
            this.close();
        }
    }

    set content(value: HTMLElement) {
        this._content.replaceChildren(value);
    }

    open() {
        this.toggleClass(this.container, 'modal_active', true);
        this.events.emit(Events.MODAL_OPEN);
        document.addEventListener('keydown', this.handleKeyDown);
    }

    close() {
        this.toggleClass(this.container, 'modal_active', false);
        document.removeEventListener('keydown', this.handleKeyDown);
        this.events.emit(Events.MODAL_CLOSE);
    }

    render(data: IModalData): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }
}