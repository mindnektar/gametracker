import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'atoms/Icon';

const IconButton = (props) => {
    const onClick = (event) => {
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

IconButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
};

export default IconButton;
