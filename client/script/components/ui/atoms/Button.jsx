import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Button = (props) => (
    <button
        className={classnames(
            'ui-button',
            { 'ui-button--disabled': props.disabled }
        )}
        onClick={props.onClick}
        type="button"
    >
        {props.children}
    </button>
);

Button.defaultProps = {
    disabled: false,
};

Button.propTypes = {
    children: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default Button;
