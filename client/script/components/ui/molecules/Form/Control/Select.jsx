import React from 'react';
import useFormData from 'hooks/useFormData';
import SelectUi from 'atoms/Select';

const Select = (props) => {
    const formData = useFormData();

    return (
        <SelectUi
            ariaLabel={formData.label}
            hasError={formData.hasError}
            onChange={formData.onChange}
            value={formData.value}
            {...props}
        />
    );
};

export default Select;
