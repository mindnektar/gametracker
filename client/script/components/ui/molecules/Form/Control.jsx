import React, { useContext, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import ModalContext from 'contexts/modal';
import FormControlContext from 'contexts/formControl';
import FormErrorBoundaryContext from 'contexts/formErrorBoundary';
import Error from 'atoms/Error';
import Select from './Control/Select';
import Slider from './Control/Slider';
import TextArea from './Control/TextArea';
import TextField from './Control/TextField';

const Control = (props) => {
    const modal = useContext(ModalContext);
    const formControlContext = useContext(FormControlContext);
    const name = formControlContext ? `${formControlContext.name}.${props.name}` : props.name;
    const validatorKey = props.validatorKey || name;

    const errorMessage = useMemo(() => {
        const error = modal.errors[validatorKey];

        if (!error) {
            return null;
        }

        const hasMatchingValidator = props.validators?.some((validator) => (
            (error.message && validator.message === error.message)
            || (error.serverError && validator.serverError === error.serverError)
        ));

        if (error.alwaysShow || hasMatchingValidator) {
            return typeof error.message === 'function' ? error.message(error.data) : error.message;
        }

        return null;
    }, [modal.errors[validatorKey]?.message?.toString()]);
    const formErrorBoundary = useContext(FormErrorBoundaryContext);
    const formControlContextValue = useMemo(() => ({
        name,
        onAfterChange: props.onAfterChange,
        validators: props.validators,
        hasError: !!errorMessage,
    }), [errorMessage]);

    useEffect(() => {
        if (formErrorBoundary) {
            formErrorBoundary.setError(errorMessage);
        }
    }, [errorMessage]);

    useEffect(() => {
        modal.registerValidators(name, props.validators, validatorKey);
    });

    useEffect(() => (
        () => {
            if (props.validators) {
                modal.deregisterFrontendValidators(validatorKey);
            }
        }
    ), []);

    return (
        <div className="ui-form-control">
            <FormControlContext.Provider value={formControlContextValue}>
                {props.children}
            </FormControlContext.Provider>

            <Error>{!formErrorBoundary && errorMessage}</Error>
        </div>
    );
};

Control.Select = Select;
Control.Slider = Slider;
Control.TextArea = TextArea;
Control.TextField = TextField;

Control.defaultProps = {
    onAfterChange: () => null,
    validatorKey: null,
    validators: null,
};

Control.propTypes = {
    children: PropTypes.node.isRequired,
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onAfterChange: PropTypes.func,
    validatorKey: PropTypes.string,
    validators: PropTypes.arrayOf(
        PropTypes.shape({
            isValid: PropTypes.func,
            message: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
            serverError: PropTypes.string,
            skip: PropTypes.func,
        }),
    ),
};

export default Control;
