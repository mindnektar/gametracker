import React, { forwardRef } from 'react';
import useFormData from 'hooks/useFormData';
import TextFieldUi from 'atoms/TextField';

const TextField = forwardRef((props, ref) => {
    const formData = useFormData();

    return (
        <TextFieldUi
            ref={ref}
            ariaLabel={formData.label}
            hasError={formData.hasError}
            onChange={formData.onChange}
            value={formData.value}
            {...props}
        />
    );
});

export default TextField;
