import { useEffect, useRef } from 'react';

export default (callback, dependencies) => {
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
        } else {
            callback();
        }
    }, dependencies);
};
