import { useState, useRef } from 'react';

export default (initialValue) => {
    const [value, setValue] = useState(initialValue);
    const ref = useRef(value);

    return [
        value,
        (next) => {
            setValue(next);
            ref.current = typeof next === 'function'
                ? next(ref.current)
                : next;
        },
        ref,
    ];
};
