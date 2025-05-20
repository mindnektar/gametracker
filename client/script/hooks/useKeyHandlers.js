import { useEffect } from 'react';

const handlerCache = {};

document.removeEventListener('keyup', window.careKeyHandler);

window.careKeyHandler = (event) => {
    if (handlerCache[event.key]?.length > 0) {
        handlerCache[event.key].at(-1)();
    }
};

document.addEventListener('keyup', window.careKeyHandler);

export default ({ handlers, dependencies = [], active = true }) => {
    useEffect(() => {
        if (active) {
            handlers.forEach(({ key, handler }) => {
                handlerCache[key] = [
                    ...(handlerCache[key] || []),
                    handler,
                ];
            });
        }

        return () => {
            if (active) {
                handlers.forEach(({ key }) => {
                    handlerCache[key] = handlerCache[key].slice(0, -1);
                });
            }
        };
    }, [...dependencies, active]);
};
