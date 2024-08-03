# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Данные и типы данных, используемые в приложении

--Продукт

```
interface IProduct {
    id: string - идентификатор продукта
    description: string - описание продукта
    image: string - url на картинку
    title: string - название продукта
    category: ProductCategory - категория продукта
    price: number | null - цена продукта
}
```

--Категория продукта

```
type ProductCategory = "софт-скил" | "другое" | "дополнительное" | "кнопка" | "хард-скил"
```

--Ошибки в форме

```
 type FormErrors = {
	email?: string;
	phone?: string;
	address?: string;
	payment?: string;
}
```

--Заказ

```
interface IOrder {
    payment: OrderPayment - тип оплаты
    email: string - email покупателя
    phone: string - телефон покупателя
    address: string - адрес покупателя
    total: number - сумма заказа
    errors: FormErrors - ошибки формы
    items: IProduct[] - список продуктов в заказе
}
```

--Тип оплаты

```
type PaymentMethod = 'card' | 'cash';
```

--Отображение продукта на главной

```
type TProduct = Omit<IProduct, "description"> // исключаем поле description
```

--Отображение продукта в корзине

```
type TBasketProduct = Pick<IProduct, "id" | "title" | "price">; // оставляем только id, title и price

```

--Результат заказа

```
interface IOrderResult {
    id: string; // идентификатор заказа
    total: number; // сумма заказа
}

```

--Тип открытого модального окна

```
type AppStateModal = "product" | "basket" | "order"
```

## Архитектура приложения

Приложение построено на основе событийного взаимодействия. 
Модели генерируют события, которые обрабатываются слушателями, 
передающими данные компонентам интерфейса и обновляющими значения в моделях.

Архитектура приложения следует парадигме MVP (Model-View-Presenter):

- **View (Представление)**: отвечает за отображение данных на пользовательском интерфейсе.
- **Model (Модель)**: управляет данными и их изменениями.
- **Presenter (Презентер)**: связывает представление и модель, обеспечивая их взаимодействие.

### Базовый код

#### Класс Api

Этот класс содержит основную логику для отправки запросов. 
В конструктор передается базовый URL сервера и необязательный 
объект с заголовками запросов.

**Методы:**
- `get(uri: string)`: выполняет GET-запрос на указанный URI и возвращает промис с ответом от сервера.
- `post(uri: string, data: object, method: ApiPostMethods = 'POST')`: отправляет данные в формате JSON на 
указанный URI с помощью POST-запроса (метод запроса можно изменить, передав третий параметр).
- `handleResponse(response: Response)`: защищенный метод, который возвращает объект JSON при успешном 
выполнении запроса или статус и текст ошибки при неудаче.

 Инициализация свойств экземпляра:
   - this.baseUrl = baseUrl;: Сохраняем переданный базовый URL в свойстве baseUrl экземпляра класса.
   - this.options = { ... }: Инициализируем свойство options, которое будет содержать настройки для запросов. 
   В частности, мы задаем заголовки для всех запросов.

 Настройка заголовков:
   - headers: { 'Content-Type': 'application/json', ...(options.headers as object ?? {}) }:
     - 'Content-Type': 'application/json': Устанавливаем заголовок Content-Type по умолчанию на 'application/json', чтобы указать, что тело запроса будет в формате JSON.
     - ...(options.headers as object ?? {}): Если в переданных опциях (options) есть заголовки (headers), мы объединяем их с нашими заголовками по умолчанию. Использование оператора расширения (...) позволяет добавить все ключи и значения из объекта options.headers в объект заголовков. Приведение к типу object и использование оператора нулевого слияния (??) гарантирует, что если options.headers не определены, будет использован пустой объект.

**Типы данных**

- **baseUrl: string**: Это строка, представляющая базовый URL для API.
- **options: RequestInit**: Это объект, который может включать различные параметры конфигурации для HTTP-запросов. 
Интерфейс RequestInit определяется в Fetch API и включает такие свойства как:
  - method: Метод HTTP-запроса (например, 'GET', 'POST').
  - headers: Заголовки HTTP-запроса.
  - body: Тело HTTP-запроса (например, строка JSON).


#### Класс EventEmitter

Позволяет подписываться на события и уведомлять подписчиков
о наступлении события. Класс используется в презентере для обработки событий и в слоях
приложения для генерации событий.  

Основные методы:
- `on(eventName: EventName, callback: (event: T) => void)`: добавляет обработчик для указанного события.
- `off(eventName: EventName, callback: Subscriber)`: удаляет обработчик для указанного события.
- `emit(eventName: string, data?: T)`: инициирует событие с передачей данных (если необходимо).
- `onAll(callback: (event: EmitterEvent) => void)`: слушает все события.
- `offAll()`: удаляет все обработчики событий.
- `trigger(eventName: string, context?: Partial<T>)`: возвращает функцию, которая генерирует событие при вызове.

 Конструктор класса EventEmitter
```
constructor() {
    this._events = new Map<EventName, Set<Subscriber>>();
}
```

 Пояснение

1. **Инициализация _events**:
   - В конструкторе класса EventEmitter создается новое свойство _events.
   - _events представляет собой карту (Map), где ключами являются имена событий (EventName), а значениями — множества (Set) подписчиков (Subscriber).

2. **Типы данных**:
   - **EventName**: тип данных для ключей карты _events. Это либо строка (string), либо регулярное выражение (RegExp). 
     ```
     type EventName = string | RegExp;
     ```
   - **Subscriber**: тип данных для значений множеств в карте _events. Это функции, которые принимают объект события в качестве аргумента.
     ```
     type Subscriber = (event: object) => void;
     ```

Описание

- **Map<EventName, Set<Subscriber>>**:
  - Map — это коллекция ключ-значение, где каждый ключ уникален.
  - Ключи (EventName) могут быть либо строками, представляющими имена событий, либо регулярными выражениями для более сложного сопоставления имен событий.
  - Значения — это множества (Set), содержащие подписчиков (Subscriber). Множество гарантирует, что каждый подписчик может быть добавлен только один раз для каждого события.


#### Класс Component

Этот базовый класс предназначен для создания представлений. Он использует дженерики и в конструкторе 
принимает элемент разметки, который будет заполняться данными из модели.

**Основные методы:**

- `toggleClass(element: HTMLElement, className: string, force?: boolean)`: Переключает класс у элемента. 
Параметры: элемент разметки, имя класса для переключения, необязательный булевый параметр 
для принудительного включения или выключения класса.
- `setText(element: HTMLElement, value: unknown)`: Устанавливает текст для элемента.
- `setDisabled(element: HTMLElement, state: boolean)`: Устанавливает или снимает атрибут disabled. 
Параметры: элемент разметки и булевый флаг, определяющий состояние атрибута.
- `setHidden(element: HTMLElement)`: Скрывает элемент.
- `setVisible(element: HTMLElement)`: Делает элемент видимым.
- `setImage(element: HTMLImageElement, src: string, alt?: string)`: Устанавливает изображение для элемента 
с возможностью задать альтернативный текст.
- `render(data?: Partial<T>)`: Возвращает элемент с заполненными данными. Принимает необязательный параметр data, 
который может содержать частичные данные указанного типа.

Конструктор класса Component
```
protected constructor(protected readonly container: HTMLElement) {
    // исполняется перед всеми объявлениями в подклассе
}
```
Пояснение

1. **Инициализация container**:
   - Конструктор класса Component принимает один аргумент container, который является экземпляром класса HTMLElement.
   - Этот аргумент представляет собой корневой DOM-элемент, с которым будет работать компонент.
   - Свойство container объявлено как protected readonly, что означает, что оно доступно в самом классе и его потомках, но не может быть изменено после инициализации.

2. **Тип данных**:
   - container: тип данных — HTMLElement. Это базовый тип для всех элементов HTML.

**Описание**

- **protected**: модификатор доступа, который позволяет использовать свойство или метод внутри самого класса и его подклассов (потомков), но не за пределами этих классов.
- **readonly**: модификатор, который делает свойство неизменяемым после его инициализации. То есть значение свойства можно установить только один раз — в конструкторе.
- **HTMLElement**: базовый интерфейс для всех объектов, представляющих элементы HTML. 


#### Класс Model

Этот родительский класс предназначен для работы с данными и использует дженерики.
Конструктор:
```
export abstract class Model<T> {
    constructor(data: Partial<T>, protected events: IEvents) { //Принимает данные выбранного типа (возможно неполные) и экземпляр IEvents для управления событиями.
      
        Object.assign(this, data);
    }

    emitChanges(event: string, payload?: object) {
        this.events.emit(event, payload ?? {});
    }    
}
```

Пояснение

1. **Тип параметра data**:
   - data: Partial<T>
   - data — это объект, содержащий частичные данные модели. Тип Partial<T> означает, что data может содержать любые подмножества свойств типа T. Это удобно для инициализации модели с неполными данными.

2. **Тип параметра events**:
   - events: IEvents
   - events — это объект, реализующий интерфейс IEvents. Этот объект используется для управления событиями внутри модели.

3. **Инициализация свойств модели**:
   - Object.assign(this, data);
   - Использует метод Object.assign для копирования всех перечисляемых свойств из объекта data в текущий экземпляр модели (this). Это позволяет инициализировать свойства модели значениями из объекта data.

Типы данных

- **data**: тип данных — Partial<T>.
  - Объект с частичными данными модели. Тип Partial<T> позволяет передавать объект с любыми подмножествами свойств типа T.

- **events**: тип данных — IEvents.
  - Интерфейс событий, используемый для взаимодействия с системой событий.


Основные методы:

- `emitChanges(event: string, payload?: object)`: Оповещает всех подписчиков об изменениях в модели. Принимает событие и данные, которые изменились.


### Слой данных

#### Класс AppData

 Конструктор класса `AppData` инициализирует объект, который управляет данными приложения, такими как список продуктов, 
корзина покупок, заказ и ошибки формы. Этот класс отвечает за управление данными приложения и расширяет класс Model.

Конструктор класса `AppData`

```
constructor(data: Partial<IAppData>, events: IEvents, products: IProduct[], basket: IProduct[], order: IOrder) {
    super(data, events);
    this.products = products;
    this.basket = new Set(basket);
    this.order = order;
}
```
Параметры конструктора

1. **data: Partial<IAppData>**
   - Тип данных: `Partial<IAppData>`
   - Описание: Это объект, содержащий частичные данные модели приложения. Тип `Partial<IAppData>` означает, что 
   объект может содержать любые подмножества свойств интерфейса `IAppData`. Это удобно для инициализации модели с неполными данными.

2. **events: IEvents**
   - Тип данных: `IEvents`
   - Описание: Это объект, реализующий интерфейс `IEvents`. Он используется для управления событиями внутри модели. 
   В т.ч для оповещения о изменении данных.

3. **products: IProduct[]**
   - Тип данных: `IProduct[]`
   - Описание: Это массив объектов, представляющих продукты. Каждый продукт соответствует интерфейсу `IProduct`.

4. **basket: IProduct[]**
   - Тип данных: `IProduct[]`
   - Описание: Это массив объектов, представляющих продукты, которые находятся в корзине покупок. Каждый продукт соответствует интерфейсу `IProduct`.

5. **order: IOrder**
   - Тип данных: `IOrder`
   - Описание: Это объект, представляющий заказ. Он соответствует интерфейсу `IOrder`, который включает информацию о платеже, адресе доставки, email, 
   телефоне и других данных заказа.

Инициализация свойств

1. **Вызов конструктора базового класса**

```
super(data, events);
```
- Здесь вызывается конструктор базового класса `Model`, который инициализирует данные модели (`data`) и объект 
событий (`events`). Метод `Object.assign(this, data)` в базовом классе копирует все 
перечисляемые свойства из объекта `data` в текущий экземпляр модели (`this`).

**Инициализация продуктов**
```
this.products = products;
```
- Здесь свойство `products` текущего экземпляра класса инициализируется переданным массивом продуктов (`products`).

3. **Инициализация корзины**

```
this.basket = new Set(basket);
```
- Здесь свойство `basket` текущего экземпляра класса инициализируется новым множеством (`Set`), 
созданным на основе переданного массива продуктов (`basket`). Это позволяет избежать дублирования продуктов в корзине.

4. **Инициализация заказа**

```
this.order = order;
```
- Здесь свойство `order` текущего экземпляра класса инициализируется переданным объектом заказа (`order`).


Методы класса:

- `setProducts(products: IProduct[])`: Устанавливает список продуктов для главной страницы.
- `selectProduct(productId: string)`: Выбирает продукт для отображения в модальном окне.
- `addProductToBasket(product: IProduct)`: Добавляет товар в корзину.
- `removeProductFromBasket(productId: string)`: Удаляет товар из корзины.
- `getBasketProducts()`: Возвращает товары в корзине.
- `getTotalPrice()`: Возвращает общую стоимость товаров в корзине.
- `clearBasket()`: Очищает корзину.
- `clearOrder()`: Очищает текущий заказ.
- `setOrderField(field: keyof IOrder, value: any)`: Устанавливает значение в поле заказа.
- `validateOrder()`: Проверяет поля заказа на корректность и устанавливает ошибки при их наличии.

#### Класс WebLarekApi

Класс WebLarekApi используется для взаимодействия с API сервиса WebLarek. Он предоставляет методы для получения списка продуктов и создания заказов. Этот класс наследует базовый функционал от класса Api, что позволяет ему выполнять HTTP-запросы к указанному базовому URL.

**Конструктор класса WebLarekApi**
```
constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
}
```

- **cdn: string** — строка, представляющая URL-адрес CDN (Content Delivery Network), который будет использоваться для загрузки ресурсов. Этот параметр задает значение для приватного поля cdn.
- **baseUrl: string** — строка, представляющая базовый URL-адрес для API запросов. Этот параметр передается в конструктор базового класса Api.
- **options?: RequestInit** — необязательный объект конфигурации для инициализации запросов. Этот параметр также передается в конструктор базового класса Api.

1. **Вызов конструктора базового класса Api**:
   - Передаются параметры baseUrl и options, которые используются для настройки базового функционала API запросов.

2. **Инициализация приватного поля cdn**:
   - Поле cdn инициализируется значением параметра cdn, предоставленного при создании экземпляра класса.

**Основные методы класса**

1. **Метод getProducts**
```
async getProducts(): Promise<List<IProduct>> {
    try {
        const response = await this.get('/product');
        return response as List<IProduct>;
    } catch (error) {
        // Обработка ошибок
        console.error('Error fetching products:', error);
        throw error;
    }
}
```
- Асинхронный метод для получения списка продуктов.
- Выполняет GET-запрос к конечной точке /product.
- Возвращает промис, который разрешается в объект типа List<IProduct>.
- В случае ошибки выводит сообщение об ошибке в консоль и повторно выбрасывает ошибку.

2. **Метод createOrder**
```
async createOrder(order: IOrder): Promise<IOrderResult> {
    try {
        const response = await this.post('/order', order);
        return response as IOrderResult;
    } catch (error) {
        // Обработка ошибок
        console.error('Error creating order:', error);
        throw error;
    }
}
```
- Асинхронный метод для создания заказа.
- Выполняет POST-запрос к конечной точке /order, передавая объект заказа order.
- Возвращает промис, который разрешается в объект типа IOrderResult.
- В случае ошибки выводит сообщение об ошибке в консоль и повторно выбрасывает ошибку.


### Классы представлений

#### Интерфейс IModalData

Определяет содержимое модального окна.
```
interface IModalData {
  content: HTMLElement; // Содержимое модального окна
}
```

#### Класс Modal

Этот общий класс предназначен для управления модальными окнами и расширяет класс `Component<IModalData>`.
Конструктор принимает элемент разметки и экземпляр IEvents для управления событиями.

Конструктор класса Modal
```
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
```
 Пояснение

1. **Вызов конструктора родительского класса**:
   - super(container);
   - Вызывает конструктор базового класса Component, передавая ему элемент container. Это необходимо для инициализации свойств и методов, определенных в базовом классе.

2. **Инициализация свойств**:
   - this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
     - Использует функцию ensureElement для поиска элемента с классом .modal__close внутри container.
     - Свойство _closeButton будет ссылаться на элемент кнопки закрытия модального окна.
     - Тип данных: HTMLButtonElement.

   - this._content = ensureElement<HTMLElement>('.modal__content', container);
     - Использует функцию ensureElement для поиска элемента с классом .modal__content внутри container.
     - Свойство _content будет ссылаться на элемент, содержащий контент модального окна.
     - Тип данных: HTMLElement.

3. **Добавление обработчиков событий**:
   - this._closeButton.addEventListener('click', this.close.bind(this));
     - Добавляет обработчик события click к кнопке закрытия.
     - При нажатии на кнопку вызывается метод close, привязанный к текущему контексту (this).

   - this.container.addEventListener('click', (event) => { ... });
     - Добавляет обработчик события click к контейнеру модального окна.
     - Если клик происходит по самому контейнеру (а не по его дочерним элементам), вызывается метод close.

   - this._content.addEventListener('click', (event) => event.stopPropagation());
     - Добавляет обработчик события click к элементу контента модального окна.
     - Останавливает распространение события клика, чтобы оно не достигло контейнера модального окна.

Типы данных

- **container**: тип данных — HTMLElement.
  - Корневой DOM-элемент, с которым будет работать компонент.
  
- **events**: тип данных — IEvents.
  - Интерфейс событий, используемый для взаимодействия с системой событий.

- **_closeButton**: тип данных — HTMLButtonElement.
  - Элемент кнопки закрытия модального окна.

- **_content**: тип данных — HTMLElement.
  - Элемент, содержащий контент модального окна.


Основные методы:

- `set content(content: HTMLElement)`: Устанавливает содержимое модального окна.
- `open()`: Открывает модальное окно, добавляя класс видимости к контейнеру и генерируя событие `modal:open`.
- `close()`: Закрывает модальное окно, удаляя класс видимости из контейнера, очищает содержимое и генерирует событие `modal:close`.



#### Класс Form

Этот класс предназначен для работы с формами и наследуется от Component.
```
constructor(protected container: HTMLFormElement, protected events: IEvents) {
    super(container);

    this._submit = ensureElement<HTMLButtonElement>(
        'button[type=submit]',
        this.container
    );
    this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

    this.container.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const field = target.name as keyof T;
        const value = target.value;
        this.onInputChange(field, value);
    });

    this.container.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        this.events.emit(`${this.container.name}:submit`);
    });
}
```
Пояснение

Вызов конструктора родительского класса
   - `super(container);`
   - Вызывает конструктор базового класса `Component`, передавая ему элемент `container`. 
   Это необходимо для инициализации свойств и методов, определенных в базовом классе.

Инициализация свойств:
   - `this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);`
     - Использует функцию `ensureElement` для поиска элемента кнопки отправки (`<button type="submit">`) внутри контейнера формы (`container`).
     - Свойство `_submit` будет ссылаться на элемент кнопки отправки формы.
      Тип данных: `HTMLButtonElement`.

   - `this._errors = ensureElement<HTMLElement>('.form__errors', this.container);`
     - Использует функцию `ensureElement` для поиска элемента, отображающего ошибки формы (с классом `.form__errors`) внутри контейнера формы (`container`).
     - Свойство `_errors` будет ссылаться на элемент, отображающий ошибки.
     - Тип данных: `HTMLElement`.

Добавление обработчиков событий**:
   - `this.container.addEventListener('input', (e: Event) => { ... });`
     - Добавляет обработчик события `input` к контейнеру формы.
     - При изменении значения любого поля ввода в форме выполняется следующая логика:
       1. Определяется целевой элемент события (`target`) как `HTMLInputElement`.
       2. Извлекается имя поля ввода (`field`) и его значение (`value`).
       3. Вызывается метод `onInputChange`, передавая ему имя поля и его значение.

   - `this.container.addEventListener('submit', (e: Event) => { ... });`
     - Добавляет обработчик события `submit` к контейнеру формы.
     - При отправке формы предотвращается стандартное поведение браузера (перезагрузка страницы) с помощью метода `preventDefault`.
     - Генерируется событие с именем `${this.container.name}:submit`, используя объект событий (`events`).

Типы данных

- **container**: тип данных — `HTMLFormElement`.
  - Элемент формы, с которым будет работать компонент.

- **events**: тип данных — `IEvents`.
  - Интерфейс событий, используемый для взаимодействия с системой событий.

- **_submit**: тип данных — `HTMLButtonElement`.
  - Элемент кнопки отправки формы.

- **_errors**: тип данных — `HTMLElement`.
  - Элемент, отображающий ошибки формы.


Основные методы:

- `onInputChange`: Обрабатывает изменения значений в полях ввода.
- `set isButtonActive`: Устанавливает состояние активности кнопки отправки.
- `set errors`: Устанавливает тексты ошибок для полей формы.


#### Класс BasketView

Класс BasketView предназначен для управления отображением корзины покупок на веб-странице. Он наследуется от базового класса Component, что позволяет ему использовать общие методы и свойства. Обеспечивает функционал добавления и удаления продуктов, обновления общей стоимости заказа.

**Конструктор класса BasketView** 
- инициализирует объект, который управляет отображением корзины покупок. 

```
constructor(container: HTMLElement, private readonly events: IEvents) {
    super(container);

    this.list = ensureElement<HTMLElement>('.basket__list', this.container);
    this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
    this.button = ensureElement<HTMLButtonElement>('.basket__button', this.container);

    this.button.addEventListener('click', this.handleOrderStart);

    this.products = [];
}
```

Параметры конструктора

1. **container: HTMLElement**
   - Тип данных: HTMLElement
   - Описание: Это HTML-элемент, который будет служить контейнером для отображения корзины. Он передается в конструктор базового класса Component.

2. **events: IEvents**
   - Тип данных: IEvents
   - Описание: Это объект, реализующий интерфейс IEvents. Он используется для управления событиями внутри компонента корзины. Например, для оповещения о начале оформления заказа.

Инициализация свойств

1. **Вызов конструктора базового класса**
```
super(container);
```
- Здесь вызывается конструктор базового класса Component, который инициализирует контейнер компонента (container).

2. **Инициализация списка продуктов**
```
this.list = ensureElement<HTMLElement>('.basket__list', this.container);
```
- Здесь свойство list текущего экземпляра класса инициализируется элементом HTML с классом .basket__list, найденным внутри контейнера. Функция ensureElement гарантирует, что элемент существует и имеет правильный тип.

3. **Инициализация элемента для отображения общей стоимости**
```
this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
```
- Здесь свойство totalElement текущего экземпляра класса инициализируется элементом HTML с классом .basket__price, найденным внутри контейнера. Функция ensureElement гарантирует, что элемент существует и имеет правильный тип.

4. **Инициализация кнопки для начала оформления заказа**
```
this.button = ensureElement<HTMLButtonElement>('.basket__button', this.container);
```
- Здесь свойство button текущего экземпляра класса инициализируется элементом HTML кнопки с классом .basket__button, найденным внутри контейнера. Функция ensureElement гарантирует, что элемент существует и имеет правильный тип.

5. **Добавление обработчика событий на кнопку**
```
this.button.addEventListener('click', this.handleOrderStart);
```
- Здесь к кнопке добавляется обработчик событий на событие click, который вызывает метод handleOrderStart. Этот метод отправляет событие начала оформления заказа.

6. **Инициализация списка продуктов в корзине**
```
this.products = [];
```
- Здесь свойство products текущего экземпляра класса инициализируется пустым массивом. Это начальное состояние списка продуктов в корзине.

Конструктор класса BasketView выполняет следующие действия:
1. Вызывает конструктор базового класса Component с переданным контейнером.
2. Инициализирует элементы HTML для списка продуктов, общей стоимости и кнопки оформления заказа, используя функцию ensureElement.
3. Добавляет обработчик событий на кнопку для начала оформления заказа.
4. Инициализирует пустой массив продуктов в корзине.


Методы класса

**Метод handleOrderStart**

- метод вызывается при нажатии на кнопку оформления заказа. Он триггерит событие order:start, используя объект events.

**Метод addProduct**

- добавляет продукт в корзину и вызывает метод render для обновления отображения корзины.

**Метод removeProduct**

- удаляет продукт из корзины по его идентификатору и вызывает метод render для обновления отображения корзины.

**Метод updateTotal**

- вычисляет общую стоимость продуктов в корзине и обновляет текстовое содержимое элемента totalElement.

**Метод render**

- отображение списка продуктов в корзине и вызывает метод updateTotal для обновления общей стоимости.



#### Класс ProductView

Класс ProductView предназначен для управления отображением продукта на веб-странице. Он наследуется от базового класса Component, что позволяет ему использовать общие методы и свойства, характерные для всех компонентов пользовательского интерфейса.
Управляет отображением отдельного продукта на веб-странице.
**Конструктор класса ProductView**
```
constructor(container: HTMLElement, actions: IProductActions) {
    super(container);

    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._image = ensureElement<HTMLImageElement>('.card__image', container);
    this._category = ensureElement<HTMLElement>('.card__category', container);
    this._price = ensureElement<HTMLElement>('.card__price', container);
    this._button = container.querySelector<HTMLButtonElement>('.card__button');

    if (actions?.onClick) {
        if (this._button) {
            this._button.addEventListener('click', actions.onClick);
        } else {
            container.addEventListener('click', actions.onClick);
        }
    }
}
```

- **container: HTMLElement** — HTML-элемент, который будет использоваться как контейнер для отображения продукта.
- **actions: IProductActions** — объект, содержащий действия, которые можно выполнить с продуктом (например, обработчик клика).

Конструктор выполняет следующие действия:
1. Инициализирует свойства _title, _image, _category, _price и _button, используя функцию ensureElement для поиска соответствующих элементов в контейнере.
2. Если передан объект actions с методом onClick, добавляет обработчик события клика на кнопку продукта или на сам контейнер, если кнопка не найдена.

**Основные методы класса**

1. **Сеттер title**
```
set title(value: string) {
    this.setText(this._title, value);
}
```
- Устанавливает текст заголовка продукта.

2. **Геттер title**
```
get title(): string {
    return this._title.textContent || '';
}
```
- Возвращает текст заголовка продукта.

3. **Сеттер image**
```
set image(value: string) {
    this.setImage(this._image, value, this.title);
}
```
- Устанавливает изображение продукта.

4. **Сеттер category**
```
set category(value: keyof typeof ProductCategory) {
    if (this._category) {
        this.setText(this._category, value);
        const categoryStyle = card__category_${ProductCategory[value]};
        this.toggleClass(this._category, categoryStyle, true);
    }
}
```
- Устанавливает категорию продукта и применяет соответствующий стиль.

5. **Сеттер price**
```
set price(value: string) {
    this.setText(this._price, value);
}
```
- Устанавливает цену продукта.

6. **Сеттер status**
```
set status(status: boolean) {
    if (this._button) {
        if (!this._price.textContent) {
            this.setText(this._button, 'Недоступно');
            this.setDisabled(this._button, true);
        } else {
            this.setText(this._button, status ? 'Уже в корзине' : 'В корзину');
            this.setDisabled(this._button, status);
        }
    }
}
```
- Устанавливает статус продукта (доступен или уже в корзине) и обновляет текст кнопки.

#### Класс ProductViewModal

Класс ProductViewModal расширяет функциональность ProductView, добавляя поддержку описания продукта. 


 **Конструктор класса ProductViewModal**
```
constructor(container: HTMLElement, actions: IProductActions) {
    super(container, actions);
    this._description = ensureElement<HTMLElement>('.card__text', container);
}
```

- **container: HTMLElement** — HTML-элемент, который будет использоваться как контейнер для отображения модального окна продукта.
- **actions: IProductActions** — объект, содержащий действия, которые можно выполнить с продуктом (например, обработчик клика).

Конструктор выполняет следующие действия:
1. Вызывает конструктор базового класса ProductView.
2. Инициализирует свойство _description, используя функцию ensureElement для поиска соответствующего элемента в контейнере.

### Основные методы класса

1. **Сеттер description**
```
set description(value: string) {
    this.setText(this._description, value);
}
```
- Устанавливает описание продукта.

#### Класс ProductInBasketView

Класс ProductInBasketView предназначен для управления отображением продукта в корзине покупок. Он наследуется от базового класса Component.

**Конструктор класса ProductInBasketView**
```
constructor(container: HTMLElement, actions?: IProductActions) {
    super(container);
    this._index = ensureElement<HTMLElement>('.basket__item-index', container);
    this._price = ensureElement<HTMLElement>('.card__price', container);
    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._button = container.querySelector<HTMLButtonElement>('.basket__item-delete');

    if (actions?.onClick && this._button) {
        this._button.addEventListener('click', actions.onClick);
    }
}
```

- **container: HTMLElement** — HTML-элемент, который будет использоваться как контейнер для отображения продукта в корзине.
- **actions?: IProductActions** — необязательный объект, содержащий действия, которые можно выполнить с продуктом (например, обработчик клика).

Конструктор выполняет следующие действия:
1. Инициализирует свойства _index, _price, _title и _button, используя функцию ensureElement для поиска соответствующих элементов в контейнере.
2. Если передан объект actions с методом onClick, добавляет обработчик события клика на кнопку удаления продукта из корзины.

Основные методы класса

1. **Сеттер index**
```
set index(value: number) {
    this.setText(this._index, value.toString());
}
```
- Устанавливает индекс продукта в корзине.

2. **Сеттер price**
```
set price(value: number) {
    this.setText(this._price, ${value} синапсов);
}
```
- Устанавливает цену продукта в корзине.

3. **Сеттер title**
```
set title(value: string) {
    this.setText(this._title, value);
}
```
- Устанавливает заголовок продукта в корзине.


#### Класс OrderForm

Класс `OrderForm` используется для управления формой заказа, включая выбор метода оплаты (онлайн или наличными) и ввод 
адреса доставки. Класс наследуется от базового класса `Form<IOrder>`, 
что позволяет ему использовать общие методы и свойства, характерные для всех форм.
Он обеспечивает взаимодействие с пользователем через кнопки и поля ввода, а также управление состоянием формы и 
отправку событий при изменении данных формы.

**Конструктор класса `OrderForm`**

```
constructor(container: HTMLFormElement, protected events: IEvents) {
    super(container, events);

    this.buttonOnlinePayment = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
    this.buttonCashPayment = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
    this.inputAddress = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

    this.buttonOnlinePayment.addEventListener('click', () => this.togglePaymentMethod('card'));
    this.buttonCashPayment.addEventListener('click', () => this.togglePaymentMethod('cash'));
}
```

- **`container: HTMLFormElement`** — HTML-элемент формы, который будет использоваться как контейнер для отображения и управления формой заказа.
- **`events: IEvents`** — объект, предоставляющий интерфейс для работы с событиями.

Конструктор выполняет следующие действия:
1. Вызывает конструктор базового класса `Form<IOrder>`, передавая ему контейнер и объект событий.
2. Инициализирует следующие элементы формы, используя функцию `ensureElement` для их поиска в контейнере:
   - **`buttonOnlinePayment`** — кнопка для выбора онлайн-оплаты (тип: `HTMLButtonElement`).
   - **`buttonCashPayment`** — кнопка для выбора оплаты наличными (тип: `HTMLButtonElement`).
   - **`inputAddress`** — поле ввода адреса (тип: `HTMLInputElement`).
3. Добавляет обработчики событий клика на кнопки выбора метода оплаты:
   - При клике на кнопку онлайн-оплаты вызывается метод `togglePaymentMethod` с аргументом `'card'`.
   - При клике на кнопку оплаты наличными вызывается метод `togglePaymentMethod` с аргументом `'cash'`.

**Основные методы класса**

1. **Метод `toggleButton`**

```
private toggleButton(button: HTMLButtonElement, state = true): void {
    button.classList.toggle('button_alt-active', state);
}
```
- Переключает состояние кнопки, добавляя или удаляя CSS-класс `'button_alt-active'`.

2. **Метод `togglePaymentMethod`**

```
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
```
- Переключает метод оплаты между онлайн-оплатой и оплатой наличными, обновляя соответствующие кнопки и состояние оплаты.

3. **Метод `resetPaymentButtons`**

```
public resetPaymentButtons(): void {
    this.toggleButton(this.buttonOnlinePayment, false);
    this.toggleButton(this.buttonCashPayment, false);
}
```
- Сбрасывает состояние кнопок выбора метода оплаты, делая их неактивными.

4. **Сеттер `address`**

```
public set address(value: string) {
    this.inputAddress.value = value;
}
```
- Устанавливает значение поля ввода адреса.

5. **Сеттер `payment`**

```
public set payment(value: PaymentMethod) {
    this.events.emit(Events.SET_PAYMENT_TYPE, { paymentType: value });
}
```
- Устанавливает метод оплаты и вызывает событие изменения типа оплаты.

6. **Метод `getFormData`**

```
public getFormData(): Partial<IOrder> {
    return {
        address: this.inputAddress.value,
        payment: this.buttonOnlinePayment.classList.contains('button_alt-active') ? 'card' :
                 this.buttonCashPayment.classList.contains('button_alt-active') ? 'cash' : null
    };
}
```
- Возвращает данные формы в виде объекта, содержащего адрес и выбранный метод оплаты.

#### Класс PageView 

Используется для управления отображением страницы, включая обновление списка продуктов, счетчика корзины и состояния блокировки страницы. Он также обрабатывает пользовательские действия, такие как клик на кнопку корзины.

**Конструктор класса PageView**
```
constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
    this._productsContainer = ensureElement<HTMLElement>('.gallery');
    this._basketButton = ensureElement<HTMLElement>('.header__basket');
    this._wrapper = ensureElement<HTMLElement>('.page__wrapper');

    this._basketButton.addEventListener('click', this.handleBasketClick);
}
```

- **container: HTMLElement** — HTML-элемент контейнера, в котором будет размещаться компонент. Этот контейнер передается в базовый класс Component.
- **events: IEvents** — объект, предоставляющий интерфейс для работы с событиями. Он используется для взаимодействия с другими частями приложения через события.

Действия, выполняемые в конструкторе

1. **Вызов конструктора базового класса Component**:
   - Передается container, который будет использоваться для инициализации базового функционала компонента.

2. **Инициализация элементов страницы с помощью функции ensureElement**:
   - **this._basketCounter** — элемент, отображающий счетчик корзины (тип: HTMLElement). Найден по селектору .header__basket-counter.
   - **this._productsContainer** — контейнер для отображения продуктов (тип: HTMLElement). Найден по селектору .gallery.
   - **this._basketButton** — кнопка для открытия корзины (тип: HTMLElement). Найдена по селектору .header__basket.
   - **this._wrapper** — обертка страницы (тип: HTMLElement). Найдена по селектору .page__wrapper.

3. **Добавление обработчика событий на кнопку корзины**:
   - На элемент this._basketButton добавляется обработчик клика, который вызывает метод handleBasketClick.

**Методы класса**

1. **Метод handleBasketClick**
```
private handleBasketClick = (): void => {
    this.events.emit(Events.BASKET_OPEN);
}
```
- Обработчик клика на кнопку корзины. Вызывает событие Events.BASKET_OPEN, чтобы уведомить другие части приложения о том, что корзина должна быть открыта.

2. **Сеттер products**
```
set products(products: HTMLElement[]) {
    this._productsContainer.replaceChildren(...products);
}
```
- Обновляет содержимое контейнера продуктов, заменяя текущие элементы новыми элементами из массива products.

3. **Сеттер locked**
```
set locked(value: boolean) {
    this.toggleClass(this._wrapper, 'page__wrapper_locked', value);
}
```
- Устанавливает состояние блокировки страницы. Добавляет или удаляет CSS-класс 'page__wrapper_locked' на элементе _wrapper, в зависимости от значения value.

4. **Сеттер basketCounter**
```
set basketCounter(counter: number) {
    this.setText(this._basketCounter, counter.toString());
}
```
- Обновляет текстовое содержимое элемента _basketCounter, устанавливая его значение равным строковому 
представлению числа counter.


### Класс SucessView

Используется для отображения сообщения об успешном завершении какой-либо операции (успешного создания заказа). Предоставляет методы для установки и получения заголовка и описания сообщения, а также для обработки событий.

**Основные методы класса**

1. **Метод set title(value: string)**

```
set title(value: string) {
    this.setText(this._title, value);
}
```
- Устанавливает текст заголовка.
- Принимает строку value, которая будет установлена как текст элемента _title.

2. **Метод get title(): string**
```
get title(): string {
    return this._title.textContent || '';
}
```
- Возвращает текущий текст заголовка.
- Если текст отсутствует, возвращает пустую строку.

3. **Метод set description(value: string)**
```
set description(value: string) {
    this.setText(this._description, value);
}
```
- Устанавливает текст описания.
- Принимает строку value, которая будет установлена как текст элемента _description.

4. **Метод get description(): string**
```
get description(): string {
    return this._description.textContent || '';
}
```
- Возвращает текущий текст описания.
- Если текст отсутствует, возвращает пустую строку.

**Конструктор класса**

```
constructor(container: HTMLElement, actions: ISuccessActions) {
    super(container);

    this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
    this._title = ensureElement<HTMLElement>('.order-success__title', this.container);
    this._description = ensureElement<HTMLElement>('.order-success__description', this.container);

    if (actions?.onClick) {
        this._close.addEventListener('click', actions.onClick);
    }
}
```

- **container: HTMLElement** — HTML-элемент, который будет использоваться в качестве контейнера для компонента. Этот параметр передается в конструктор базового класса Component.
- **actions: ISuccessActions** — объект, содержащий действия, которые могут быть выполнены. В данном случае, это объект с методом onClick, который будет вызван при клике на элемент закрытия.

**Описание конструкора**

1. **Вызов конструктора базового класса Component**:
   - Передается параметр container, который используется для инициализации базового функционала компонента.

2. **Инициализация приватных полей**:
   - **this._close**: Инициализируется элементом, найденным с помощью функции ensureElement по селектору .order-success__close. Этот элемент представляет собой кнопку или элемент закрытия.
   - **this._title**: Инициализируется элементом, найденным с помощью функции ensureElement по селектору .order-success__title. Этот элемент представляет собой заголовок.
   - **this._description**: Инициализируется элементом, найденным с помощью функции ensureElement по селектору .order-success__description. Этот элемент представляет собой описание.

3. **Добавление обработчика событий**:
   - Если в объекте actions присутствует метод onClick, он добавляется как обработчик события click для элемента _close.


### Основные события

- `products:changed`: Событие изменения списка товаров.
- `basket:add-product`: Добавление товара в корзину.
- `basket:remove-product`: Удаление товара из корзины.
- `basket:create-order`: Оформление заказа.
- `basket:open`: Открытие корзины пользователя.
- `product:preview`: Открытие модального окна с товаром.
- `form:errors-changed`: Показ или скрытие ошибок формы.
- `order:open`: Открытие формы заказа.
- `order:clear`: Очистка формы заказа.
- `order:set-payment-type`: Выбор типа оплаты.
- `modal:open`: Открытие модального окна.
- `modal:close`: Закрытие модального окна.