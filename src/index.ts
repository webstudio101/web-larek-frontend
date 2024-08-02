import './scss/styles.scss';
import {EventEmitter} from "./components/base/events";
import {API_URL, CDN_URL} from "./utils/constants";
import {WebLarekApi} from './components/webLarekApi';
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {AppData, ProductsChangeEvent} from "./components/appData";
import {PageView} from "./components/pageView";
import {ProductInBasketView, ProductView, ProductViewModal} from "./components/product";
import {Events, IOrder, IProduct} from "./types";
import {Modal} from "./components/common/modal";
import {BasketView} from "./components/basketView";
import {OrderForm} from "./components/orderForm";
import {ContactsForm} from "./components/contactsForm";
import {SuccessView} from "./components/successView";

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const productModal = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const productInBasket = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successOrderTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppData({}, events, [], [], {
    email: '',
    phone: '',
    payment: null,
    address: '',
    total: 0,
    items: []
});

// Контейнеры
const pageView = new PageView(document.body, events);
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate(contactsTemplate), events);
const successView = new SuccessView(cloneTemplate(successOrderTemplate), {
    onClick: () => {
        modal.close();
        events.emit(Events.ORDER_CLEAR);
    },
});

// Бизнес-логика

events.on<ProductsChangeEvent>(Events.PRODUCTS_CHANGED, () => {
    updateBasketCounter();
    updateProductList();
});


// Обновление списка продуктов
function updateProductList(): void {
    pageView.products = appData.getProducts().map(item => createProductView(item));
}

function createProductView(item: IProduct): HTMLElement {
    const product = new ProductView(cloneTemplate(cardCatalogTemplate), {
        onClick: () => events.emit(Events.PRODUCT_OPEN_IN_MODAL, item)
    });
    
    return product.render({
        id: item.id,
        title: item.title,
        image: `${CDN_URL}${item.image}`,
        category: item.category,
        price: item.price ? `${item.price} синапсов` : 'Бесценно'
    });
}

events.on<IProduct>(Events.PRODUCT_OPEN_IN_MODAL, (product) => {
    openProductInModal(product);
});

function openProductInModal(product: IProduct): void {
    const card = new ProductViewModal(cloneTemplate(productModal), {
        onClick: () => events.emit(Events.ADD_PRODUCT_TO_BASKET, product),
    });

    modal.render({
        content: card.render({
            title: product.title,
            image: `${CDN_URL}${product.image}`,
            category: product.category,
            description: product.description,
            price: product.price ? `${product.price} синапсов` : '',
            status: product.price === null || appData.getBasket().some(item => item.id === product.id)
        }),
    });
}


// Блокируем прокрутку страницы если открыта модалка
events.on(Events.MODAL_OPEN, () => {
    pageView.locked = true;
});

// Разблокируем прокрутку страницы если закрыли модалку
events.on(Events.MODAL_CLOSE, () => {
    pageView.locked = false;
});


// Обработчики событий
events.on(Events.ADD_PRODUCT_TO_BASKET, handleAddProductToBasket);
events.on(Events.BASKET_OPEN, handleBasketOpen);
events.on(Events.REMOVE_PRODUCT_FROM_BASKET, handleRemoveProductFromBasket);

// Добавляем продукт в корзину
function handleAddProductToBasket(product: IProduct) {
    appData.addProductToBasket(product);
    updateBasketCounter();
    modal.close();
}

function handleBasketOpen() {
    const products = appData.getBasket().map((item, index) => createProductInBasketView(item, index));
    renderBasketModal(products);
}
//Удаляем продукт из корзины
function handleRemoveProductFromBasket(product: IProduct) {
    appData.removeProductFromBasket(product);
    updateBasketCounter();
}

function updateBasketCounter() {
    pageView.basketCounter = appData.getBasket().length;
}

function createProductInBasketView(item: IProduct, index: number) {
    const productView = new ProductInBasketView(cloneTemplate(productInBasket), {
        onClick: () => events.emit(Events.REMOVE_PRODUCT_FROM_BASKET, item)
    });
    return productView.render({
        index: index + 1,
        id: item.id,
        title: item.title,
        price: item.price
    });
}

function renderBasketModal(products: HTMLElement[]) {
    const total = appData.getTotalPrice();
    const content = createElement<HTMLElement>('div', {}, [
        basketView.render({
            products,
            total
        })
    ]);
    modal.render({ content });
}

events.on(Events.ORDER_START, handleOrderStart);
events.on(Events.SET_PAYMENT_TYPE, handleSetPaymentType);
events.on(/(^order|^contacts)\..*:change/, handleFieldChange);
events.on(Events.FORM_ERRORS_CHANGED, handleFormErrorsChanged);
events.on(/(^order|^contacts):submit/, handleSubmitOrder);
events.on(Events.ORDER_CLEAR, handleOrderClear);

// Начинаем оформление заказа
function handleOrderStart() {
    const data = appData.isFirstFormFill()
        ? { phone: '', email: '' }
        : { address: '' };

    const form = appData.isFirstFormFill() ? contactsForm : orderForm;

    modal.render({
        content: form.render({
            valid: false,
            errors: [],
            ...data
        })
    });
}

// Устанавливаем тип оплаты
function handleSetPaymentType(data: { paymentType: string }) {
    appData.setOrderField("payment", data.paymentType);
}

// Изменилось одно из полей
function handleFieldChange(data: { field: keyof Omit<IOrder, 'items' | 'total'>; value: string }) {
    appData.setOrderField(data.field, data.value);
}

// Изменилось состояние валидации формы
function handleFormErrorsChanged(errors: Partial<IOrder>) {
    const { email, phone, address, payment } = errors;

    orderForm.valid = !address && !payment;
    orderForm.errors = formatErrors(errors);

    contactsForm.valid = !email && !phone;
    contactsForm.errors = formatErrors(errors);
}

function formatErrors(errors: Partial<IOrder>): string {
    return Object.values(errors)
        .filter((i) => !!i)
        .join(', ');
}

// Отправлена форма заказа
function handleSubmitOrder() {
    const order = appData.getOrder();
    
    if (!order.email || !order.address || !order.phone) {
        return events.emit(Events.ORDER_START);
    }

    const products = appData.getBasket();

    api.createOrder({
        ...order,
        items: products.map(product => product.id),
        total: appData.getTotalPrice(),
    })
    .then(handleOrderResult)
    .catch(console.error);
}

function handleOrderResult(result: any) {
    modal.render({
        content: successView.render({
            title: !result.error ? 'Заказ оформлен' : 'Ошибка оформления заказа',
            description: !result.error ? `Списано ${result.total} синапсов` : result.error,
        }),
    });
}

// Очистить заказ и корзину
function handleOrderClear() {
    appData.clearBasket();
    appData.clearOrder();
    orderForm.resetPaymentButtons();
}

// Получаем продукты с сервера
api.getProducts()
    .then(data => appData.setProducts(data.items))
    .catch(console.error);
