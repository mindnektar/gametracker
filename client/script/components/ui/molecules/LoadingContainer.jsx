import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'atoms/Loader';

const LoadingContainer = (props) => (
    <div className="ui-loading-container">
        {props.children || (
            <div className="ui-loading-container__loader">
                <Loader />
            </div>
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
