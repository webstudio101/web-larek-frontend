import { Component } from "./base/component";
import { ensureElement } from "../utils/utils";

interface ISuccess {
    title: string;
    description: string;
}

interface ISuccessActions {
    onClick: () => void;
}

export class SuccessView extends Component<ISuccess> {
    private _close: HTMLElement;
    private _title: HTMLElement;
    private _description: HTMLElement;

    constructor(container: HTMLElement, actions: ISuccessActions) {
        super(container);

        this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
        this._title = ensureElement<HTMLElement>('.order-success__title', this.container);
        this._description = ensureElement<HTMLElement>('.order-success__description', this.container);

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    get description(): string {
        return this._description.textContent || '';
    }
}
