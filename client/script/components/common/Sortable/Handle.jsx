import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Handle = (props) => (
    <div className={classnames('sortable-handle', props.className)}>
        {props.children}
    </div>
);

Handle.defaultProps = {
    className: null,
};

Handle.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

export default Handle;
