export const prepareValues = (source, defaultValues) => (
    Object.entries(defaultValues).reduce((result, [key, value]) => {
        let config = {
            defaultValue: value,
            modify: (item) => item,
            sourceKey: key,
        };

        if (typeof value === 'function') {
            config = { ...config, ...value() };
        } else if (typeof value === 'object') {
            return {
                ...result,
                [key]: prepareValues(source && source[key], value),
            };
        }

        return {
            ...result,
            [key]: (
                source
                && source[config.sourceKey] !== undefined
                && source[config.sourceKey] !== null
            )
                ? config.modify(source[config.sourceKey], source)
                : config.modify(config.defaultValue, source),
        };
    }, {})
);
