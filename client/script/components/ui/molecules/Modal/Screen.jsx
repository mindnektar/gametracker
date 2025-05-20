import React from 'react';
import PropTypes from 'prop-types';

const Screen = (props) => (
    <div className="ui-modal-screen">
        {props.children}
    </div>
);

Screen.defaultProps = {
    children: null,
};

Screen.propTypes = {
    children: PropTypes.node,
    headline: PropTypes.string.isRequired,
};

export default Screen;
