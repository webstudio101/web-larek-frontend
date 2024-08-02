import { Component } from "./base/component";
import { IEvents } from "./base/events";
import { createElement, ensureElement } from "../utils/utils";
import { Events } from "../types";

interface IBasketView {
    products: HTMLElement[];
    total: number;
}

export class BasketView extends Component<IBasketView> {
    private readonly list: HTMLElement;
    private readonly totalElement: HTMLElement;
    private readonly button: HTMLButtonElement;

    constructor(container: HTMLElement, private readonly events: IEvents) {
        super(container);

        this.list = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.button = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this.button.addEventListener('click', this.handleOrderStart);

        this.products = [];
    }

    private handleOrderStart = (): void => {
        this.events.emit(Events.ORDER_START);
    };

    public toggleButton(state: boolean): void {
        this.setDisabled(this.button, state);
    }

    public set products(products: HTMLElement[]) {
        this.list.innerHTML = '';
        
        if (products.length) {
            this.list.append(...products);
            this.toggleButton(false);
        } else {
            const emptyMessage = createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста',
            });
            this.list.appendChild(emptyMessage);
            this.toggleButton(true);
        }
    }

    public set total(total: number) {
        this.setText(this.totalElement, `${total} синапсов`);
    }
}
