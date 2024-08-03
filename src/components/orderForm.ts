import { IEvents } from "./base/events";
import { Events, IOrder, PaymentMethod } from "../types";
import { Form } from "./common/form";
import { ensureElement } from "../utils/utils";

export class OrderForm extends Form<IOrder> {
    private readonly buttonOnlinePayment: HTMLButtonElement;
    private readonly buttonCashPayment: HTMLButtonElement;
    private readonly inputAddress: HTMLInputElement;

    constructor(container: HTMLFormElement, protected events: IEvents) {
        super(container, events);

        this.buttonOnlinePayment = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.buttonCashPayment = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.inputAddress = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

        this.buttonOnlinePayment.addEventListener('click', () => this.togglePaymentMethod('card'));
        this.buttonCashPayment.addEventListener('click', () => this.togglePaymentMethod('cash'));
    }

      private toggleButton(button: HTMLButtonElement, state = true): void {
        button.classList.toggle('button_alt-active', state);
    }

    public togglePaymentMethod(selectedPayment: Exclude<PaymentMethod, null>): void {
        const isCardActive = this.buttonOnlinePayment.classList.contains('button_alt-active');
        const isCashActive = this.buttonCashPayment.classList.contains('button_alt-active');

        if (selectedPayment === 'card') {
            this.toggleButton(this.buttonOnlinePayment, !isCardActive);
            this.payment = isCardActive ? null : 'card';
            if (!isCardActive) this.toggleButton(this.buttonCashPayment, false);
        } else if (selectedPayment === 'cash') {
            this.toggleButton(this.buttonCashPayment, !isCashActive);
            this.payment = isCashActive ? null : 'cash';
            if (!isCashActive) this.toggleButton(this.buttonOnlinePayment, false);
        }
    }

    public resetPaymentButtons(): void {
        this.toggleButton(this.buttonOnlinePayment, false);
        this.toggleButton(this.buttonCashPayment, false);
    }

    public set address(value: string) {
        this.inputAddress.value = value;
    }

    public set payment(value: PaymentMethod) {
        this.events.emit(Events.SET_PAYMENT_TYPE, { paymentType: value });
    }

    public getFormData(): Partial<IOrder> {
        return {
            address: this.inputAddress.value,
            payment: this.buttonOnlinePayment.classList.contains('button_alt-active') ? 'card' :
                     this.buttonCashPayment.classList.contains('button_alt-active') ? 'cash' : null
        };
    }
}
