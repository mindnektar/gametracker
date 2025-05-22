import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import IconButton from 'atoms/IconButton';

const PopupDialogItem = (props) => (
    <div
        aria-label={props.label}
        className={classnames(
            'ui-popup-dialog-item',
            {
                'ui-popup-dialog-item--active': props.isActive,
                'ui-popup-dialog-item--disabled': props.disabled,
            },
        )}
        onClick={!props.disabled && !props.loading && props.progress === null ? props.onClick : null}
        role="button"
        tabIndex={0}
    >
        {(props.icon || props.image) && (
            <IconButton
                color={props.color}
                destructive={props.destructive}
                disabled={props.disabled}
                image={props.image}
                important={props.isActive}
                loading={props.loading}
                notification={props.notification}
                progress={props.progress}
                size={IconButton.SIZE_SMALL}
                type={props.icon}
            />
        )}

        <div className="ui-popup-dialog-item__label">
            {props.label}

            {props.subLabel && (
                <div className="ui-popup-dialog-item__sub-label">
                    {props.subLabel}
                </div>
            )}
        </div>
    </div>
);

PopupDialogItem.defaultProps = {
    color: null,
    destructive: false,
    disabled: false,
    icon: null,
    image: null,
    isActive: false,
    loading: false,
    notification: false,
    progress: null,
    subLabel: null,
};

PopupDialogItem.propTypes = {
    color: PropTypes.string,
    destructive: PropTypes.bool,
    disabled: PropTypes.bool,
    icon: PropTypes.string,
    image: PropTypes.string,
    isActive: PropTypes.bool,
    label: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    notification: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    progress: PropTypes.number,
    subLabel: PropTypes.string,
};

export default PopupDialogItem;
