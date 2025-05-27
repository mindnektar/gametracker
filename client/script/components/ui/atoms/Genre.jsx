import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Genre = (props) => (
    <span
        className={classnames(
            'ui-genre',
            {
                'ui-genre--active': props.active,
                'ui-genre--interactive': !!props.onClick,
            }
        )}
        onClick={props.onClick}
    >
        {props.name}
    </span>
);

Genre.defaultProps = {
    active: false,
    onClick: null,
};

Genre.propTypes = {
    active: PropTypes.bool,
    onClick: PropTypes.func,
    name: PropTypes.string.isRequired,
};

export default Genre;
