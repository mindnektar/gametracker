import { useState } from 'react';

export default (initialValue, callback) => {
    const [state, setState] = useState(initialValue);

    return [
        state,
        (value) => (
            setState((previous) => {
                const nextValue = typeof value === 'boolean' ? value : !previous;

                if (previous !== nextValue && callback) {
                    window.requestAnimationFrame(() => {
                        callback(nextValue);
                    });
                }

                return nextValue;
            })
        ),
    ];
};
