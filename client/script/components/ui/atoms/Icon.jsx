import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Icon = (props) => (
    <div className={classnames('ui-icon', `ui-icon--${props.type}`)}>
        {props.type}
    </div>
);

Icon.propTypes = {
    type: PropTypes.string.isRequired,
};

export default Icon;
