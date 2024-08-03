export function pascalToKebab(value: string): string {
    return value.replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function isSelector(x: any): x is string {
    return (typeof x === "string") && x.length > 1;
}

export function isEmpty(value: any): boolean {
    return value === null || value === undefined;
}

export type SelectorCollection<T> = string | NodeListOf<Element> | T[];

export function ensureAllElements<T extends HTMLElement>(
    selectorElement: SelectorCollection<T>,
    context: HTMLElement = document.body
): T[] {
    if (isSelector(selectorElement)) {
        return Array.from(context.querySelectorAll(selectorElement)) as T[];
    }
    if (selectorElement instanceof NodeList) {
        return Array.from(selectorElement) as T[];
    }
    if (Array.isArray(selectorElement)) {
        return selectorElement;
    }
    throw new Error('Unknown selector element');
}

export type SelectorElement<T> = T | string;

export function ensureElement<T extends HTMLElement>(
    selectorElement: SelectorElement<T>,
    context: HTMLElement = document.body
): T {
    if (isSelector(selectorElement)) {
        const elements = ensureAllElements<T>(selectorElement, context);
        if (elements.length > 1) {
            console.warn(`Selector "${selectorElement}" returned more than one element`);
        }
        if (elements.length === 0) {
            throw new Error(`Selector "${selectorElement}" returned no elements`);
        }
        return elements[0];
    }
    if (selectorElement instanceof HTMLElement) {
        return selectorElement as T;
    }
    throw new Error('Unknown selector element');
}

export function cloneTemplate<T extends HTMLElement>(query: string | HTMLTemplateElement): T {
    const template = ensureElement(query) as HTMLTemplateElement;
    const clone = template.content.firstElementChild?.cloneNode(true) as T;
    if (!clone) {
        throw new Error('Template has no content');
    }
    return clone;
}

export function bem(block: string, element?: string, modifier?: string): { name: string; class: string } {
    const name = [
        block,
        element && `__${element}`,
        modifier && `_${modifier}`
    ].filter(Boolean).join('');
    
    return {
        name,
        class: `.${name}`
    };
}

export function getObjectProperties(
    obj: object,
    filter: (name: string, prop: PropertyDescriptor) => boolean = (name) => name !== 'constructor'
): string[] {
    return Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(obj)))
        .filter(([name, prop]) => filter(name, prop))
        .map(([name]) => name);
}


/**
 * Устанавливает dataset атрибуты элемента
 */
export function setElementData<T extends Record<string, unknown> | object>(el: HTMLElement, data: T) {
    for (const key in data) {
        el.dataset[key] = String(data[key]);
    }
}

/**
 * Получает типизированные данные из dataset атрибутов элемента
 */
// export function getElementData<T extends Record<string, unknown>>(el: HTMLElement, scheme: Record<string, Function>): T {
//     const data: Partial<T> = {};
//     for (const key in el.dataset) {
//         data[key as keyof T] = scheme[key](el.dataset[key]);
//     }
//     return data as T;
// }

export function getElementData<T extends Record<string, unknown>>(el: HTMLElement, scheme: Record<string, (schema: string) => T[keyof T]>): T {
    const data: Partial<T> = {};
    for (const key in el.dataset) {
        if (key in scheme) {
            data[key as keyof T] = scheme[key](el.dataset[key] as string);
        }
    }
    return data as T;
}



/**
 * Проверка на простой объект
 */
export function isPlainObject(obj: unknown): obj is object {
    const prototype = Object.getPrototypeOf(obj);
    return  prototype === Object.getPrototypeOf({}) ||
        prototype === null;
}


/**
 * Фабрика DOM-элементов в улучшенной реализации
 */
export function createElement<T extends HTMLElement>(
    tagName: keyof HTMLElementTagNameMap,
    props?: Partial<T>,
    children?: string | Node | (string | Node)[]
): T {
    const element = document.createElement(tagName) as T;

    if (props) {
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'dataset' && typeof value === 'object') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = String(dataValue);
                });
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
            } 
            else {
                // @ts-expect-error: Свойство может не существовать на всех HTMLElement
                element[key] = value;
            }
        });
    }

    if (children) {
        const appendChild = (child: string | Node) => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        };

        if (Array.isArray(children)) {
            children.forEach(appendChild);
        } else {
            appendChild(children);
        }
    }

    return element;
}


