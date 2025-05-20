import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import FormContext from 'contexts/form';
import useToggle from 'hooks/useToggle';
import Control from './Form/Control';
import ErrorBoundary from './Form/ErrorBoundary';
import Row from './Form/Row';

const Form = (props) => {
    const [isRequiredTextVisible, showRequiredText] = useToggle(false);
    const formContextValue = useMemo(() => ({
        showRequiredText,
    }), []);

    return (
        <div className="ui-form">
            <FormContext.Provider value={formContextValue}>
                {props.children}
            </FormContext.Provider>

            {isRequiredTextVisible && (
                <div className="ui-form__footnote">
                    * required
                </div>
            )}
        </div>
    );
};

Form.propTypes = {
    children: PropTypes.node.isRequired,
};

Form.Control = Control;
Form.ErrorBoundary = ErrorBoundary;
Form.Row = Row;

export default Form;
