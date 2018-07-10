import { isArray, isObject } from 'lodash';

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