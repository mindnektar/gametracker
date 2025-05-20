import React from 'react';
import useFormData from 'hooks/useFormData';
import SliderUi from 'atoms/Slider';

const Slider = (props) => {
    const formData = useFormData();

    return (
        <SliderUi
            ariaLabel={formData.label}
            hasError={formData.hasError}
            onChange={formData.onChange}
            value={formData.value}
            {...props}
        />
    );
};

export default Slider;
