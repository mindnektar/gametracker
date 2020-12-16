import React from 'react';
import PropTypes from 'prop-types';
import FormItem from './Form/FormItem';

const Form = (props) => (
    <div className="ui-form">
        {props.children}
    </div>
);

Form.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Form;
export { FormItem };
