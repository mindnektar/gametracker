import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Rating = (props) => (
    <div
        className={classnames(
            'rating',
            {
                'rating--personal': props.personal,
                'rating--good': props.value >= 75,
                'rating--mediocre': props.value >= 50 && props.value < 75,
                'rating--bad': props.value < 50,
            },
        )}
    >
        <div
            className="rating__inner"
            style={{ width: `${props.value}%` }}
        />

        <div className="rating__text">
            {!props.value ? '-' : props.value / 10}
        </div>
    </div>
);

Rating.defaultProps = {
    personal: false,
    value: null,
};

Rating.propTypes = {
    personal: PropTypes.bool,
    value: PropTypes.number,
};

export default Rating;
