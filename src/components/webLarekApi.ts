import { List } from "../types/list";
import { IOrder, IOrderResult, IProduct } from "../types";
import { Api } from "./base/api";

// Интерфейс для API WebLarek
export interface IWebLarekApi {
    getProducts(): Promise<List<IProduct>>;
    createOrder(order: IOrder): Promise<IOrderResult>;
}

// Класс для работы с API WebLarek
export class WebLarekApi extends Api implements IWebLarekApi {
    private readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

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
}
