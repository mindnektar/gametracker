import React from 'react';
import PropTypes from 'prop-types';

const TextArea = (props) => {
    const onChange = (event) => {
        props.onChange(event.target.value);
    };

    return (
        <textarea
            className="ui-text-area"
            onChange={onChange}
            value={props.value}
        />
    );
};

TextArea.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default TextArea;
