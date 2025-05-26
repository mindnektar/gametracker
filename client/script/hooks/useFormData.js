import { useContext, useMemo } from 'react';
import { findDeep } from 'helpers/objects';
import ModalContext from 'contexts/modal';
import FormControlContext from 'contexts/formControl';
import FormRowContext from 'contexts/formRow';

export default ({ onAfterChange } = {}) => {
    const modal = useContext(ModalContext);
    const formControl = useContext(FormControlContext);
    const formRow = useContext(FormRowContext);

    if (!formControl) {
        return null;
    }

    const formValue = findDeep(modal.formValues, formControl.name);

    return useMemo(() => ({
        label: typeof formRow?.label === 'string' ? formRow.label : null,
        onChange: (value) => {
            modal.setFormValue(formControl.name, value);
            modal.setErrorMessageHandler(formControl.name)(null);
            formControl.onAfterChange(value);
            onAfterChange?.(value);
        },
        onSubmit: () => {
            modal.confirm();
        },
        onError: modal.setErrorMessageHandler(formControl.name),
        value: formValue,
        hasError: formControl.hasError,
    }), [formValue, formControl.hasError]);
};
