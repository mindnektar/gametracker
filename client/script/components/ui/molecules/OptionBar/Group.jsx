import React from 'react';
import PropTypes from 'prop-types';

const Group = (props) => (
    <div className="ui-option-bar-group">
        {props.children}
    </div>
);

Group.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Group;
