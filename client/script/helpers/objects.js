export const getFiltersFromString = (string) => {
    const filterRegex = /^\{(.*)\}$/;

    if (!string.match(filterRegex)) {
        return null;
    }

    return string
        .replace(filterRegex, '$1')
        .split(',')
        .map((filter) => {
            const [key, value] = filter.split('=');

            return { key, value };
        });
};

const findInObject = (object, attributes = []) => {
    const nextAttributes = [...attributes];
    const attribute = nextAttributes.shift();

    if (!attribute) {
        return object;
    }

    let nextObject = object?.[attribute];
    const filters = getFiltersFromString(attribute);

    if (filters) {
        nextObject = object?.find((item) => (
            filters.every(({ key, value }) => `${item[key]}` === value)
        ));
    }

    return findInObject(nextObject, nextAttributes);
};

export const findDeep = (object, attributeString = null) => (
    findInObject(object, attributeString?.split('.'))
);

export const isObject = (value) => (
    value && typeof value === 'object' && value.constructor === Object
);

export const arrayToggle = (array, value, toggle = null, idFields = null) => {
    const clone = array ? [...array] : [];
    const index = clone.findIndex((item) => (
        idFields
            ? idFields.every((idField) => findDeep(item, idField) === findDeep(value, idField))
            : item === value
    ));

    if (index >= 0) {
        if (toggle === null || toggle === false) {
            clone.splice(index, 1);
        }
    } else if (toggle === null || toggle === true) {
        clone.push(value);
    }

    return clone;
};
