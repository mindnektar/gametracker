import React from 'react';
import PropTypes from 'prop-types';

const LoadingContainer = (props) => (
    <div className="ui-loading-container">
        {props.children || (
            'Loading'
        )}
    </div>
);

LoadingContainer.defaultProps = {
    children: null,
};

LoadingContainer.propTypes = {
    children: PropTypes.node,
};

export default LoadingContainer;
