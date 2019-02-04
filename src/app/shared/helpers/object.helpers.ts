import { isArray, isObject, isString } from 'lodash';

export function objectWithoutProperties(obj, keys) {
    const target = {};
    for (const propertyName in obj) {
        if (keys.indexOf(propertyName) >= 0) { continue; }

        const value = obj[propertyName];

        if (isArray(value)) {
            target[propertyName] = value.map(o => objectWithoutProperties(o, keys));
        } else if (isObject(value)) {
            target[propertyName] = objectWithoutProperties(value, keys);
        } else {
            target[propertyName] = value;
        }

    }

    return target;
}


const JavascriptTypes = ['string', 'number', 'boolean'];

export function objectWithoutProperties2(obj, keys) {

    if (JavascriptTypes.indexOf(typeof(obj)) !== -1 ) {
        return obj;
    }

    const target = {};
    for (const propertyName in obj) {
        if (keys.indexOf(propertyName) >= 0) { continue; }

        const value = obj[propertyName];

        if (isArray(value)) {
            target[propertyName] = value.map(o => objectWithoutProperties2(o, keys));
        } else if (isObject(value)) {
            target[propertyName] = objectWithoutProperties2(value, keys);
        } else {
            target[propertyName] = value;
        }

    }

    return target;
}
