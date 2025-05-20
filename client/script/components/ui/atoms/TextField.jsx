import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const TextField = forwardRef((props, ref) => {
    const onChange = (event) => {
        props.onChange(event.target.value);
    };

    const onKeyDown = (event) => {
        if (event.key === 'Enter') {
            props.onSubmit(event.target.value);
        }
    };

    return (
        <div className={classNames('ui-text-field', { 'ui-text-field--has-error': props.hasError })}>
            <input
                ref={ref}
                className="ui-text-field__input"
                onChange={onChange}
                onKeyDown={onKeyDown}
                type="text"
                value={props.value}
            />
        </div>
    );
});

TextField.defaultProps = {
    hasError: false,
    onSubmit: null,
};

TextField.propTypes = {
    hasError: PropTypes.bool,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
};

export default TextField;
