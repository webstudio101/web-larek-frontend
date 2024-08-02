import { Model } from "./base/model";
import { Events, FormErrors, IAppData, IOrder, IProduct } from "../types";
import { IEvents } from "./base/events";

export type ProductsChangeEvent = {
    products: IProduct[];
};

export class AppData extends Model<IAppData> {
    private products: IProduct[];
    private basket: Set<IProduct>;
    private order: IOrder;
    private formErrors: FormErrors = {};

    constructor(data: Partial<IAppData>, events: IEvents, products: IProduct[], basket: IProduct[], order: IOrder) {
        super(data, events);
        this.products = products;
        this.basket = new Set(basket);
        this.order = order;
    }

    setProducts(products: IProduct[]): void {
        this.products = products;
        this.emitChanges(Events.PRODUCTS_CHANGED, { products: this.products });
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    getBasket(): IProduct[] {
        return Array.from(this.basket);
    }

    addProductToBasket(product: IProduct): void {
        this.basket.add(product);
        this.emitChanges(Events.BASKET_OPEN);
    }

    getTotalPrice(): number {
        return Array.from(this.basket).reduce((total, product) => total + product.price, 0);
    }

    removeProductFromBasket(product: IProduct): void {
        this.basket.delete(product);
        this.emitChanges(Events.BASKET_OPEN);
    }

    getOrder(): IOrder {
        return this.order;
    }

    isFirstFormFill(): boolean {
        return Boolean(this.order?.address && this.order?.payment);
    }

    setOrderField(field: keyof Omit<IOrder, 'items' | 'total'>, value: string): void {
        this.order = { ...this.order, [field]: value };
        if (this.validateOrder(field)) {
            this.events.emit(Events.ORDER_READY, this.order);
        }
    }

    validateOrder(field: keyof IOrder): boolean {
        const errors: Partial<Record<keyof IOrder, string>> = {};

        if (field === 'email' || field === 'phone') {
            if (!this.order.email.match(/^\S+@\S+\.\S+$/)) {
                errors.email = 'Необходимо указать корректный email';
            }
            if (!this.order.phone.match(/^\+7\d{10}$/)) {
                errors.phone = 'Необходимо указать корректный телефон';
            }
        } else if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        } else if (!this.order.payment) {
            errors.payment = 'Необходимо выбрать тип оплаты';
        }

        this.formErrors = errors;
        this.events.emit(Events.FORM_ERRORS_CHANGED, this.formErrors);
        return Object.keys(errors).length === 0;
    }

    clearBasket(): void {
        this.basket.clear();
        this.emitChanges(Events.PRODUCTS_CHANGED, { products: this.products });
    }

    clearOrder(): void {
        this.order = {
            payment: null,
            address: '',
            email: '',
            phone: '',
            total: 0,
            items: [],
        };
        this.emitChanges(Events.ORDER_READY, this.order);
    }
}
