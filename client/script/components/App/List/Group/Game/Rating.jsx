import React from 'react';
import PropTypes from 'prop-types';

const Rating = (props) => (
    <div className="rating">
        <div
            className="rating__inner"
            style={{ width: `${props.value}%` }}
        />

        <div className="rating__text">
            {props.value}
        </div>
    </div>
);

Rating.propTypes = {
    value: PropTypes.number.isRequired,
};

export default Rating;
