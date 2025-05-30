import React from 'react';
import PropTypes from 'prop-types';

const Icon = (props) => (
    <div className="ui-icon">
        {props.type}
    </div>
);

Icon.propTypes = {
    type: PropTypes.string.isRequired,
};

export default Icon;
