import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import useToggle from 'hooks/useToggle';

const Button = (props) => {
    const [confirmation, showConfirmation, hideConfirmation] = useToggle(false);

    const onClick = () => {
        if (confirmation || !props.destructive) {
            props.onClick();
        } else if (props.destructive) {
            showConfirmation();
        }
    };

    return (
        <OutsideClickHandler onOutsideClick={hideConfirmation}>
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
        </OutsideClickHandler>
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
