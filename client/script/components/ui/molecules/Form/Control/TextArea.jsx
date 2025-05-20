import React from 'react';
import PropTypes from 'prop-types';
import useFormData from 'hooks/useFormData';
import classnames from 'classnames';

const TextArea = (props) => {
    const formData = useFormData();

    const onChange = (event) => {
        formData.onChange(event.target.value);
    };

    return (
        <div
            className={classnames(
                'ui-form-text-area',
                {
                    'ui-form-text-area--monospace': props.monospace,
                    'ui-form-text-area--has-error': formData.hasError,
                },
            )}
        >
            <textarea
                aria-label={formData.label}
                className="ui-form-text-area__input"
                maxLength={props.maxLength}
                onChange={onChange}
                style={{ height: props.height }}
                value={formData.value}
            />
        </div>
    );
};

TextArea.defaultProps = {
    height: 114,
    maxLength: undefined,
    monospace: false,
};

TextArea.propTypes = {
    height: PropTypes.number,
    maxLength: PropTypes.number,
    monospace: PropTypes.bool,
};

export default TextArea;
