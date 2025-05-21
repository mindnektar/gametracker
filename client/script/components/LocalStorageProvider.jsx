import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import LocalStorageContext from 'contexts/localStorage';

const LocalStorageProvider = (props) => {
    const listeners = useRef(new Map());
    const defaultValues = {};

    const subscribe = (key, callback) => {
        if (!listeners.current.has(key)) {
            listeners.current.set(key, new Set());
        }

        listeners.current.get(key).add(callback);

        return () => {
            listeners.current.get(key).delete(callback);
        };
    };

    const setValue = (key, value) => {
        const storage = JSON.parse(window.localStorage.getItem('storage') || '{}');
        const nextValue = typeof value === 'function' ? value(storage[key]) : value;

        window.localStorage.setItem('storage', JSON.stringify({ ...storage, [key]: nextValue }));

        if (listeners.current.has(key)) {
            listeners.current.get(key).forEach((callback) => callback(nextValue));
        }

        if (sideEffects[key]) {
            sideEffects[key](nextValue);
        }
    };

    const getValue = (key) => {
        const storage = JSON.parse(window.localStorage.getItem('storage') || '{}');

        return storage[key] ?? defaultValues[key];
    };

    const sideEffects = {
        locale: (value) => moment.locale(value),
    };

    const contextValue = useMemo(() => ({
        subscribe,
        setValue,
        getValue,
    }), []);

    useEffect(() => {
        Object.entries(sideEffects).forEach(([key, sideEffect]) => {
            sideEffect(getValue(key));
        });
    }, []);

    return (
        <LocalStorageContext.Provider value={contextValue}>
            {props.children}
        </LocalStorageContext.Provider>
    );
};

LocalStorageProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default LocalStorageProvider;
