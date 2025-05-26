import React from 'react';
import PropTypes from 'prop-types';
import Group from './OptionBar/Group';
import Item from './OptionBar/Item';

const OptionBar = (props) => (
    <div className="ui-option-bar">
        {props.children}
    </div>
);

OptionBar.propTypes = {
    children: PropTypes.node.isRequired,
};

OptionBar.Group = Group;
OptionBar.Item = Item;

export default OptionBar;
