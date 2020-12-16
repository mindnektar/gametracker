import React from 'react';
import PropTypes from 'prop-types';

const FormItem = (props) => (
    <div className="ui-form-item">
        <div className="ui-form-item__label">{props.label}</div>

        <div className="ui-form-item__body">
            <div className="ui-form-item__field">
                {props.children}
            </div>

            {props.error && (
                <div className="ui-form-item__error">
                    {props.error}
                </div>
            )}
        </div>
    </div>
);

FormItem.defaultProps = {
    error: null,
};

FormItem.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    error: PropTypes.string,
};

export default FormItem;
