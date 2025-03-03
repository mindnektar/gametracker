import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Button = (props) => {
    const [confirmation, setConfirmation] = useState(false);

    const onClick = () => {
        if (confirmation || !props.destructive) {
            props.onClick();
        } else if (props.destructive) {
            setConfirmation(true);
        }
    };

    return (
        <button
            className={classnames(
                'ui-button',
                {
                    'ui-button--disabled': props.disabled,
                    'ui-button--destructive': props.destructive,
                }
            )}
            onClick={onClick}
            type="button"
        >
            {confirmation ? 'Really?' : props.children}
        </button>
    );
};

Button.defaultProps = {
    disabled: false,
    destructive: false,
};

Button.propTypes = {
    children: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    destructive: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default Button;
