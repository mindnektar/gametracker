import React from 'react';
import PropTypes from 'prop-types';
import RegularSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';

const Select = (props) => {
    const Component = props.creatable ? CreatableSelect : RegularSelect;

    return (
        <Component
            className="ui-select"
            classNamePrefix="ui-select"
            options={props.items}
            onChange={props.onChange}
            value={props.value}
            isMulti={props.isMulti}
        />
    );
};

Select.defaultProps = {
    label: null,
    value: null,
    isMulti: false,
    creatable: false,
};

Select.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        label: PropTypes.string.isRequired,
    })).isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.object,
    isMulti: PropTypes.bool,
    creatable: PropTypes.bool,
};

export default Select;
