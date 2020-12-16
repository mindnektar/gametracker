import { useState } from 'react';

export default () => {
    const [state, setState] = useState(false);

    return [
        state,
        () => setState(true),
        () => setState(false),
    ];
};
