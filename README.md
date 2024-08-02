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
- src/styles/styles.scss — корневой файл стилей
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

Методы:
- `get(uri: string)`: выполняет GET-запрос на указанный URI и возвращает промис с ответом от сервера.
- `post(uri: string, data: object, method: ApiPostMethods = 'POST')`: отправляет данные в формате JSON на 
указанный URI с помощью POST-запроса (метод запроса можно изменить, передав третий параметр).
- `handleResponse(response: Response)`: защищенный метод, который возвращает объект JSON при успешном 
выполнении запроса или статус и текст ошибки при неудаче.

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

#### Класс Component

Этот базовый класс предназначен для создания представлений. Он использует дженерики и в конструкторе 
принимает элемент разметки, который будет заполняться данными из модели.

Основные методы:

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

#### Класс Model

Этот родительский класс предназначен для работы с данными и использует дженерики.

Конструктор:

- `constructor(data: Partial<T>, protected events: IEvents)`: Принимает данные выбранного типа (возможно неполные) и экземпляр IEvents для управления событиями.

Основные методы:

- `emitChanges(event: string, payload?: object)`: Оповещает всех подписчиков об изменениях в модели. Принимает событие и данные, которые изменились.

### Слой данных

#### Класс AppData

Этот класс отвечает за управление данными приложения и расширяет класс Model. Все поля приватные, доступ к ним осуществляется через методы.

В классе хранятся следующие данные:

- `products: IProduct[]`: Массив объектов продуктов.
- `basket: IProduct[]`: Массив товаров в корзине.
- `order: IOrder`: Объект заказа.
- `selectedProduct: string | null`: ID товара для отображения в модальном окне.

Класс предоставляет методы для взаимодействия с этими данными:

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

Основные свойства:

- `closeButton: HTMLButtonElement`: Кнопка закрытия модального окна.
- `content: HTMLElement`: Содержимое модального окна.

Конструктор принимает элемент разметки и экземпляр IEvents для управления событиями.

Основные методы:

- `set content(content: HTMLElement)`: Устанавливает содержимое модального окна.
- `open()`: Открывает модальное окно, добавляя класс видимости к контейнеру и генерируя событие `modal:open`.
- `close()`: Закрывает модальное окно, удаляя класс видимости из контейнера, очищает содержимое и генерирует событие `modal:close`.



#### Класс Form

Этот класс предназначен для работы с формами и наследуется от Component.

Основные методы:

- `onInputChange`: Обрабатывает изменения значений в полях ввода.
- `set isButtonActive`: Устанавливает состояние активности кнопки отправки.
- `set errors`: Устанавливает тексты ошибок для полей формы.

#### Класс BasketView

Класс для отображения корзины в модальном окне, наследуется от Modal.
```
class BasketView extends Modal {
  private basket: IProduct[]; // Список продуктов в корзине
  private total: number | null; // Общая сумма покупок
}
```

Основные методы:

- `set basket`: Задает список продуктов в корзине.
- `set total`: Устанавливает общую сумму продуктов в корзине.

#### Класс ProductView

Класс для отображения продукта на главной странице, наследуется от `Component<IProduct>`.
```
class ProductView extends Component<IProduct> {
  private product: TProduct;
}
```

#### Класс ProductModalView

Класс для отображения продукта в модальном окне, наследуется от Modal.
```
class ProductModalView extends Modal {
  private product: IProduct;
}
```

#### Класс OrderFormView

Класс для отображения формы заказа, наследуется от Modal.
```
class OrderFormView extends Modal {
  private orderFields: Record<keyof IOrder, [value: string, error: string]> | null;
  private buttonActive: boolean;
}
```

#### Класс OrderResultView

Класс для отображения результата заказа, наследуется от Modal.
```
class OrderResultView extends Modal {
  private description: string;
  private title: string;
}
```

Основные методы:

- `set title`: Устанавливает заголовок.
- `set description`: Устанавливает описание.

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