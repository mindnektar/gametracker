import { useEffect } from 'react';
import useStateWithRef from 'hooks/useStateWithRef';
import { findDeep, isObject, getFiltersFromString } from 'helpers/objects';

const formDefaults = (source, defaults) => (
    Object.entries(defaults || {}).reduce((result, [key, value]) => {
        let config = {
            _default: value,
            _key: key,
            _modify: null,
            _map: null,
            _sort: null,
        };

        if (isObject(value)) {
            config = { ...config, ...value };
        }

        const useParentAsSource = config._key === '_parent';
        const sourceValue = useParentAsSource ? source : findDeep(source, config._key);
        let finalValue = sourceValue;

        if (config._map) {
            finalValue = [];

            if (sourceValue) {
                finalValue = [...sourceValue];

                if (config._sort) {
                    finalValue.toSorted(config._sort);
                }

                finalValue = finalValue.map((item) => {
                    const mappedItem = config._map(item);

                    if (isObject(mappedItem)) {
                        return formDefaults(item, mappedItem);
                    }

                    return mappedItem;
                });
            }
        } else if (config._modify) {
            finalValue = (sourceValue !== null && sourceValue !== undefined) || useParentAsSource
                ? config._modify(sourceValue)
                : null;

            if (isObject(finalValue)) {
                finalValue = formDefaults(sourceValue, finalValue);
            }
        }

        return {
            ...result,
            [key]: finalValue ?? config._default,
        };
    }, {})
);

const getSafeValue = (newValue, oldValue) => {
    const nextValue = typeof newValue === 'function' ? newValue(oldValue) : newValue;

    return nextValue && typeof nextValue === 'object' && nextValue.constructor.name === 'Object'
        ? { ...oldValue, ...nextValue }
        : nextValue;
};

const computeValues = (currentState, segments, value) => {
    const nextSegments = [...segments];
    const segment = nextSegments.shift();
    let index;

    if (segment.match(/^\d+$/)) {
        index = parseInt(segment, 10);
    }

    const filters = getFiltersFromString(segment);

    if (filters) {
        index = currentState?.findIndex((item) => (
            filters.every((filter) => `${item[filter.key]}` === filter.value)
        )) ?? -1;
    }

    if (index !== undefined) {
        const previous = {
            ...filters?.reduce((result, filter) => ({
                ...result,
                [filter.key]: Number.isNaN(filter.value) ? filter.value : parseInt(filter.value, 10),
            }), {}),
            ...(currentState || [])[index],
        };
        const next = nextSegments.length > 0
            ? computeValues(previous, nextSegments, value)
            : getSafeValue(value, previous);

        if (index < 0) {
            return [
                ...(currentState || []),
                next,
            ];
        }

        return [
            ...currentState.slice(0, index),
            next,
            ...currentState.slice(index + 1),
        ];
    }

    return {
        ...currentState,
        [segment]: nextSegments.length > 0
            ? computeValues(currentState?.[segment], nextSegments, value)
            : getSafeValue(value, currentState?.[segment]),
    };
};

export default ({
    subject = null,
    config = {},
    dependsOn = [],
}) => {
    const [state, setState, stateRef] = useStateWithRef(formDefaults(subject, config));

    useEffect(() => {
        setState(formDefaults(subject, config));
    }, dependsOn);

    return [
        state,
        (key, value) => (
            setState((previous) => computeValues(
                previous,
                key.split('.'),
                value,
            ))
        ),
        stateRef,
    ];
};
