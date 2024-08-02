import { Component } from "./base/component";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";
import { Events } from "../types";

interface IPage {
    basketCounter: number;
    products: HTMLElement[];
    locked: boolean;
}

export class PageView extends Component<IPage> {
    private readonly _basketCounter: HTMLElement;
    private readonly _productsContainer: HTMLElement;
    private readonly _basketButton: HTMLElement;
    private readonly _wrapper: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
        this._productsContainer = ensureElement<HTMLElement>('.gallery');
        this._basketButton = ensureElement<HTMLElement>('.header__basket');
        this._wrapper = ensureElement<HTMLElement>('.page__wrapper');

        this._basketButton.addEventListener('click', this.handleBasketClick);
    }

    private handleBasketClick = (): void => {
        this.events.emit(Events.BASKET_OPEN);
    }

    set products(products: HTMLElement[]) {
        this._productsContainer.replaceChildren(...products);
    }

    set locked(value: boolean) {
        this.toggleClass(this._wrapper, 'page__wrapper_locked', value);
    }

    set basketCounter(counter: number) {
        this.setText(this._basketCounter, counter.toString());
    }

    
}
