import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Rating = (props) => (
    <div
        className={classnames(
            'ui-rating',
            {
                'ui-rating--personal': props.personal,
                'ui-rating--good': props.value >= 75,
                'ui-rating--mediocre': props.value >= 50 && props.value < 75,
                'ui-rating--bad': props.value < 50,
            },
        )}
    >
        <div
            className="ui-rating__inner"
            style={{ width: `${props.value}%` }}
        />

        <div className="ui-rating__text">
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
