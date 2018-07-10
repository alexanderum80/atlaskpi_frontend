
export interface IObservablePropertyConfig {
    dependOn?: string;
}

/**
 * Represent an observable property within a view model
 * usually this type of properties will be used in conjunction with the dependOn
 * property of the field configuration
 */
export function ObservableProperty(config?: IObservablePropertyConfig) {
    return function(target: any, key: string) {
        if (!target.__metadata__) {
            target.__metadata__ = {};
        }

        if (!target.__metadata__.observableProperties) {
            target.__metadata__.observableProperties = [];
        }

        target.__metadata__.observableProperties.push(key);

        // move the original property to the underscore version
        const instanceVariable = '_' + key;
        target[instanceVariable] = target[key];

        // create property to enable notifications
        Object.defineProperty(target, key, {
            get: () => target[instanceVariable],
            set: (value: any) => {
                const oldValue = target[instanceVariable];
                target[instanceVariable] = value;

                const notifyPropertyChange = 'notifyPropertyChange';

                if (oldValue !== value && typeof target[notifyPropertyChange] === 'function') {
                    target[notifyPropertyChange](key, oldValue, value);
                }
            }
        });
    };
}
