import React from 'react';
import PropTypes from 'prop-types';

const Icon = (props) => (
    <span className="ui-icon material-symbols-outlined">
        {props.type}
    </span>
);

Icon.propTypes = {
    type: PropTypes.string.isRequired,
};

export default Icon;
