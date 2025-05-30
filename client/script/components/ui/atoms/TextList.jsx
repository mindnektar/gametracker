import React from 'react';
import PropTypes from 'prop-types';

const TextList = (props) => (
    <div className="ui-text-list">
        <h2>
            {props.title}
        </h2>

        {props.items.length === 0 && (
            <div className="ui-text-list__empty">
                No items have been added yet.
            </div>
        )}

        {props.items.toSorted().map((item, index) => (
            <div
                key={index}
                className="ui-text-list__item"
            >
                {item}
            </div>
        ))}
    </div>
);

TextList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
    title: PropTypes.string.isRequired,
};

export default TextList;
