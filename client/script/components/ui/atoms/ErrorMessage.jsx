import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = (props) => (
    <div className="ui-error-message">
        {props.children}
    </div>
);

ErrorMessage.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorMessage;
