import { useContext, useState, useCallback, useEffect, useTransition } from 'react';
import LocalStorageContext from 'contexts/localStorage';

export default (key, defaultValue) => {
    const [isPending, startTransition] = useTransition();
    const { subscribe, setValue, getValue } = useContext(LocalStorageContext);
    const [value, setLocalValue] = useState(() => {
        const current = getValue(key);

        return current !== undefined ? current : defaultValue;
    });
    const set = useCallback((nextValue) => {
        setValue(key, nextValue);
    }, [key, setValue]);

    useEffect(() => {
        const unsubscribe = subscribe(key, (nextValue) => {
            startTransition(() => {
                setLocalValue(nextValue);
            });
        });

        return unsubscribe;
    }, [key, subscribe]);

    return [value, set, isPending];
};
