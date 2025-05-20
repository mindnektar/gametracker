import React from 'react';
import PropTypes from 'prop-types';
import Collapsible from 'molecules/Collapsible';

const Error = (props) => (
    <div className="ui-error">
        <Collapsible collapsed={!props.children}>
            <div className="ui-error__message">
                {props.children}
            </div>
        </Collapsible>
    </div>
);

Error.defaultProps = {
    children: null,
};

Error.propTypes = {
    children: PropTypes.node,
};

export default Error;
