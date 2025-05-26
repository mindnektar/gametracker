import React from 'react';
import PropTypes from 'prop-types';

const Item = (props) => (
    <div className="ui-option-bar-item">
        <div className="ui-option-bar-item__label">
            {props.label}
        </div>

        <div className="ui-option-bar-item__content">
            {props.children}
        </div>
    </div>
);

Item.defaultProps = {
    label: null,
};

Item.propTypes = {
    children: PropTypes.node.isRequired,
    label: PropTypes.string,
};

export default Item;
