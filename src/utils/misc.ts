/**
 * Objects
 */

export const hasOwnProperty = <T>(object: T, key: PropertyKey) => Object.prototype.hasOwnProperty.call(object, key)

const baseObjectPrototype = Reflect.getPrototypeOf({})
export function objectForEach<T>(
    obj: { [key: string]: T; },
    fn: (val: T, key: string, obj: { [key: string]: T; }) => void,
): void {
    /**
     * The for..in is the fastest method of iterating over objects, but it iterates also over prototypes
     * Here we are checking if the prototype of the obj is proto of the Object.
     * If not, we need to use Object.keys for iterating only over our own properties
     * Elsewhere we can use for..in
     */
    if (Object.getPrototypeOf(obj) !== baseObjectPrototype) {
        const keys = Object.keys(obj)
        const len = keys.length
        let index = -1
        while (++index < len) {
            const key = keys[index]!
            fn(obj[key] as T, key, obj)
        }
    } else {
        // Since we already know that the prototype of the object is Object - we are not gonna need to check is key are own property
        for (const key in obj) {
            fn(obj[key] as T, key, obj)
        }
    }
}


/**
 * Functions
 */
export type AnyFunction = (...args: Array<any>) => any

export function once<F extends AnyFunction>(fn: F)
{
    let called = false
    let result: ReturnType<F>
    return ((...args: Array<any>) =>
    {
        if (!called)
        {
            called = true
            result = fn(...args)
        }
        return result
    }) as F
}
