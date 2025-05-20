import React from 'react';

export default (children, params) => {
    let actualChildren = typeof children === 'function' ? children(params) : children;

    if (typeof actualChildren?.type === 'symbol' && Symbol.keyFor(actualChildren.type) === 'react.fragment') {
        actualChildren = actualChildren.props.children;
    }

    return React.Children
        .toArray(actualChildren)
        .reduce((result, child) => {
            if (!React.isValidElement(child)) {
                return result;
            }

            if (typeof child.type === 'symbol' && Symbol.keyFor(child.type) === 'react.fragment') {
                return [
                    ...result,
                    ...React.Children.toArray(child.props.children).filter(React.isValidElement),
                ];
            }

            return [...result, child];
        }, []);
};
