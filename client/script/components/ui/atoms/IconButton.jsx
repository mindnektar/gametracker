import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'atoms/Icon';

const IconButton = (props) => {
    const onClick = (event) => {
        if (!props.onClick) {
            return;
        }

        event.stopPropagation();
        props.onClick();
    };

    return (
        <button
            className="ui-icon-button"
            onClick={onClick}
            type="button"
        >
            <Icon type={props.type} />
        </button>
    );
};

IconButton.defaultProps = {
    onClick: null,
};

IconButton.propTypes = {
    onClick: PropTypes.func,
    type: PropTypes.string.isRequired,
};

export default IconButton;
