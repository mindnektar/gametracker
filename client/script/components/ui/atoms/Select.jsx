import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import findScrollParent from 'helpers/findScrollParent';
import { arrayToggle } from 'helpers/objects';
import useSimpleToggle from 'hooks/useSimpleToggle';
import useToggle from 'hooks/useToggle';
import useRepeatFor from 'hooks/useRepeatFor';
import TextField from 'atoms/TextField';
import Collapsible from 'molecules/Collapsible';

const Select = (props) => {
    const newOptionRef = useRef();
    const [opened, toggleOpened] = useSimpleToggle(false);
    const [style, setStyle] = useState({});
    const [isAdding, startAddMode, endAddMode] = useToggle(false);
    const [newOptionValue, setNewOptionValue] = useState('');
    const selectRef = useRef();
    const repeat = useRepeatFor(300);
    const options = props.options.filter((option) => (
        option.available !== false
    ));
    const sanitizedValue = (props.value ? [props.value] : []);
    const selectedOptions = (props.multiple ? props.value : sanitizedValue).map((item) => (
        options.find((option) => option.value === item) || { value: item, label: item }
    ));

    useEffect(() => {
        newOptionRef.current?.focus();
    }, [isAdding]);

    useEffect(() => {
        // When opening/closing the dropdown, continuously recalculate its position for 300ms in case another Collapsible is closing at this
        // moment
        repeat(calculatePosition);

        findScrollParent(selectRef.current).addEventListener('scroll', calculatePosition);

        return () => {
            findScrollParent(selectRef.current).removeEventListener('scroll', calculatePosition);
        };
    }, [opened, props.value]);

    const calculatePosition = () => {
        if (!selectRef.current) {
            return;
        }

        const selectRect = selectRef.current.getBoundingClientRect();
        const maxHeight = Math.min(400, window.innerHeight - (selectRect.top + (selectRect.height / 2)) - 32);

        if (maxHeight < 0) {
            close();

            return;
        }

        setStyle({
            wrapper: {
                left: selectRect.left,
                top: selectRect.top,
                width: selectRect.width,
            },
            options: {
                maxHeight,
            },
        });
    };

    const onChangeHandler = (value) => () => {
        if (props.multiple) {
            props.onChange(arrayToggle(props.value, value));
        } else {
            props.onChange(value);
            close();
        }
    };

    const onOptionKeyDownHandler = (value) => (event) => {
        event.stopPropagation();

        if (event.key === 'Enter') {
            onChangeHandler(value)();
        }
    };

    const onSelectKeyDown = (event) => {
        if (event.key === 'Enter') {
            toggleOpened();
        }
    };

    const close = () => {
        toggleOpened(false);
    };

    const clear = () => {
        props.onChange(props.multiple ? [] : null);
    };

    const addOption = (value) => {
        onChangeHandler(value.trim())();
        endAddMode();
        close();
    };

    const renderCurrent = () => (
        <div
            className="ui-select__current"
            onClick={toggleOpened}
        >
            <div className="ui-select__label">
                {selectedOptions.map((option) => option.label).join(', ')}
            </div>
        </div>
    );

    const renderOption = (option) => (
        <div
            key={option.value}
            aria-label={option.label}
            aria-selected="false"
            className={classNames(
                'ui-select__option',
                { 'ui-select__option--selected': selectedOptions.some(({ value }) => value === option.value) },
            )}
            onClick={onChangeHandler(option.value)}
            onKeyDown={onOptionKeyDownHandler(option.value)}
            role="option"
            tabIndex={0}
        >
            <div className="ui-select__label">
                {option.label}
            </div>
        </div>
    );

    return (
        <div
            ref={selectRef}
            aria-label={props.ariaLabel}
            className={classNames(
                'ui-select',
                {
                    'ui-select--opened': opened,
                    'ui-select--disabled': props.disabled,
                    'ui-select--has-error': props.hasError,
                },
            )}
            onKeyDown={onSelectKeyDown}
            role="listbox"
            tabIndex={0}
        >
            <OutsideClickHandler onOutsideClick={close}>
                <div
                    className="ui-select__options-wrapper"
                    style={style.wrapper}
                >
                    <Collapsible collapsed={!opened}>
                        {renderCurrent()}

                        <div
                            className="ui-select__options"
                            style={style.options}
                        >
                            {options.map(renderOption)}

                            {props.withCustom && (
                                <div
                                    className="ui-select__option"
                                    onClick={startAddMode}
                                >
                                    <div className="ui-select__label">
                                        {isAdding ? (
                                            <TextField
                                                ref={newOptionRef}
                                                value={newOptionValue}
                                                onChange={setNewOptionValue}
                                                onSubmit={addOption}
                                            />
                                        ) : '+ Add new item'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Collapsible>
                </div>

                {renderCurrent()}

                {props.clearable && selectedOptions.length > 0 && (
                    <div
                        className="ui-select__clear"
                        onClick={clear}
                    >
                        ✕
                    </div>
                )}
            </OutsideClickHandler>
        </div>
    );
};

Select.defaultProps = {
    ariaLabel: null,
    clearable: false,
    disabled: false,
    hasError: false,
    multiple: false,
    onChange: null,
    value: null,
    withCustom: false,
};

Select.propTypes = {
    ariaLabel: PropTypes.string,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    hasError: PropTypes.bool,
    multiple: PropTypes.bool,
    onChange: PropTypes.func,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            available: PropTypes.bool,
            icon: PropTypes.string,
            iconColor: PropTypes.string,
            image: PropTypes.string,
            label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }),
    ).isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    ]),
    withCustom: PropTypes.bool,
};

export default Select;
