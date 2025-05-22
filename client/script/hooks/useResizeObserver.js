import { useLayoutEffect } from 'react';

export default (refOrElement, callback, dependencies) => {
    useLayoutEffect(() => {
        const element = 'current' in (refOrElement || {}) ? refOrElement.current : refOrElement;

        if (!element) {
            return () => null;
        }

        const resizeObserver = new ResizeObserver(callback);

        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [dependencies]);
};
