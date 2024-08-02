import { Form } from "./common/form";
import { IOrder } from "../types";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

export class ContactsForm extends Form<IOrder> {
    private readonly inputPhone: HTMLInputElement;
    private readonly inputEmail: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this.inputPhone = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
        this.inputEmail = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
    }

    public set phone(value: string) {
        this.inputPhone.value = value;
    }

    public set email(value: string) {
        this.inputEmail.value = value;
    }

    public getFormData(): Partial<IOrder> {
        return {
            phone: this.inputPhone.value,
            email: this.inputEmail.value
        };
    }
}
