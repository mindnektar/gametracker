import React from 'react';
import PropTypes from 'prop-types';
import ErrorMessage from 'atoms/ErrorMessage';
import Collapsible from 'molecules/Collapsible';

const FormItem = (props) => (
    <div className="ui-form-item">
        <div className="ui-form-item__label">{props.label}</div>

        <div className="ui-form-item__body">
            <div className="ui-form-item__field">
                {props.children}
            </div>

            <Collapsible collapsed={!props.error}>
                <ErrorMessage>
                    {props.error}
                </ErrorMessage>
            </Collapsible>
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
