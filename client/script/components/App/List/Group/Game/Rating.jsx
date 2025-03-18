import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Rating = (props) => (
    <div
        className={classnames(
            'rating',
            { 'rating--visible': props.visible },
        )}
    >
        <div
            className="rating__inner"
            style={{ width: `${props.value}%` }}
        />

        <div className="rating__text">
            {props.value / 10}
        </div>
    </div>
);

Rating.propTypes = {
    value: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
};

export default Rating;
