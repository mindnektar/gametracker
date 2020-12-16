import React from 'react';
import PropTypes from 'prop-types';

const Button = (props) => (
    <button
        className="ui-button"
        onClick={props.onClick}
        type="button"
    >
        {props.children}
    </button>
);

Button.propTypes = {
    children: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default Button;
