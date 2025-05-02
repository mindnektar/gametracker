import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = (props) => (
    <div className="ui-error-message">
        {props.children}
    </div>
);

ErrorMessage.defaultProps = {
    children: null,
};

ErrorMessage.propTypes = {
    children: PropTypes.node,
};

export default ErrorMessage;
