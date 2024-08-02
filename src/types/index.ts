// Типы данных
export enum ProductCategory {
    'софт-скил' = 'soft',
    'другое' = 'other',
    'хард-скил' = 'hard',
    'дополнительное' = 'additional',
    'кнопка' = 'кнопка'
}

export interface IProduct {
    id: string
    description: string
    image: string
    title: string
    category: ProductCategory
    price: number | null
}



export type PaymentMethod = 'card' | 'cash';

export interface IOrder {
    payment: PaymentMethod;
    email: string
    phone: string
    address: string
    total: number
    items: string[]
}

export type FormErrors = {
    email?: string;
    phone?: string;
    address?: string;
    payment?: string;
};

export type AppStateModal = "product" | "basket" | "order";

// Отображение продукта в корзине
export type TBasketProduct = Pick<IProduct, "id" | "title" | "price">

export type ListItem = {
    index: number
}

export interface IOrderResult {
    id: string
    total: number
    error?: string
}

// Модель
export interface IAppData {
    products: IProduct[]
    basket: IProduct[]
    order: IOrder
}

export enum Events {
    PRODUCTS_CHANGED = 'products:changed',
    PRODUCT_OPEN_IN_MODAL = 'product:openInModal',
    ADD_PRODUCT_TO_BASKET = 'product:addToBasket',
    MODAL_OPEN = 'modal:open',
    MODAL_CLOSE = 'modal:close',
    BASKET_OPEN = 'basket:open',
    ORDER_START = 'order:start',
    REMOVE_PRODUCT_FROM_BASKET = 'product:removeFromBasket',
    SET_PAYMENT_TYPE = 'order:setPaymentType',
    ORDER_READY = 'order:ready',
    FORM_ERRORS_CHANGED = 'form:errorsChanged',
    ORDER_CLEAR = 'order:clear',
}