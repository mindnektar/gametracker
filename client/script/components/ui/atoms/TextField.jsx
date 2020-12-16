import React from 'react';
import PropTypes from 'prop-types';

const TextField = (props) => {
    const onChange = (event) => {
        props.onChange(event.target.value);
    };

    return (
        <div className="ui-text-field">
            <input
                className="ui-text-field__input"
                onChange={onChange}
                type="text"
                value={props.value}
            />
        </div>
    );
};

TextField.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default TextField;
