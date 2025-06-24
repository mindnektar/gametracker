import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import findScrollParent from 'helpers/findScrollParent';
import { arrayToggle } from 'helpers/objects';
import useSimpleToggle from 'hooks/useSimpleToggle';
import useToggle from 'hooks/useToggle';
import useRepeatFor from 'hooks/useRepeatFor';
import Icon from 'atoms/Icon';
import TextField from 'atoms/TextField';
import Collapsible from 'molecules/Collapsible';

const Select = (props) => {
    const newOptionRef = useRef();
    const selectedOptionRef = useRef();
    const [opened, toggleOpened] = useSimpleToggle(false);
    const [style, setStyle] = useState({});
    const [isAdding, startAddMode, endAddMode] = useToggle(false);
    const [newOptionValue, setNewOptionValue] = useState('');
    const selectRef = useRef();
    const repeat = useRepeatFor(300);
    const options = props.options.filter((option) => (
        option.available !== false
    ));
    const sanitizedValue = props.value ? [props.value] : [];
    const selectedOptions = (props.multiple ? props.value : sanitizedValue).map((item) => (
        options.find((option) => option.value === item) || { value: item, label: item }
    ));
    const newOptions = selectedOptions.filter((option) => (
        !options.some(({ value }) => value === option.value)
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

    useLayoutEffect(() => {
        if (opened) {
            window.setTimeout(() => {
                selectedOptionRef.current?.scrollIntoView({ block: 'center' });
            }, 400);
        }
    }, [opened]);

    useEffect(() => {
        if (props.defaultValue && !props.options.some(({ value }) => value === props.value)) {
            props.onChange(props.defaultValue);
        }
    }, [options.length]);

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

    const renderCurrent = (withArrow = false) => {
        const fallback = selectedOptions.length === 0 ? props.fallback : null;
        const displayValue = props.decorator ? (
            selectedOptions
                .toSorted((a, b) => a.label.localeCompare(b.label))
                .map((option) => props.decorator(option.label))
        ) : (
            <span>
                {selectedOptions
                    .toSorted((a, b) => a.label.localeCompare(b.label))
                    .map((option) => option.label)
                    .join(', ')}
            </span>
        );

        return (
            <div
                className="ui-select__current"
                onClick={toggleOpened}
            >
                <div className="ui-select__label">
                    {!props.multiple && selectedOptions.length > 0 && (
                        <>
                            {selectedOptions[0].image}

                            {selectedOptions[0].icon && (
                                <div
                                    className="ui-select__icon"
                                    style={{ color: selectedOptions[0].iconColor }}
                                >
                                    <Icon type={selectedOptions[0].icon} />
                                </div>
                            )}
                        </>
                    )}

                    {fallback ?? displayValue}
                </div>

                {withArrow && (
                    <div className="ui-select__arrow">
                        <Icon type="arrow_drop_down" />
                    </div>
                )}
            </div>
        );
    };

    const renderOption = (option) => (
        <div
            key={option.value}
            ref={selectedOptions.some(({ value }) => value === option.value) ? selectedOptionRef : null}
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
                {option.image}

                {option.icon && (
                    <div
                        className="ui-select__icon"
                        style={{ color: option.iconColor }}
                    >
                        <Icon type={option.icon} />
                    </div>
                )}

                <span>
                    {option.label}
                </span>
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
            role="listbox"
            tabIndex={0}
        >
            <OutsideClickHandler onOutsideClick={close}>
                <div
                    className="ui-select__options-wrapper"
                    style={style.wrapper}
                >
                    <Collapsible collapsed={!opened}>
                        {renderCurrent(true)}

                        <div
                            className="ui-select__options"
                            style={style.options}
                        >
                            {[...options, ...newOptions].toSorted((a, b) => a.label.localeCompare(b.label)).map(renderOption)}

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

                {renderCurrent(!props.clearable || selectedOptions.length === 0)}

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
    decorator: null,
    disabled: false,
    fallback: '',
    hasError: false,
    multiple: false,
    onChange: null,
    value: null,
    withCustom: false,
    defaultValue: null,
};

Select.propTypes = {
    ariaLabel: PropTypes.string,
    clearable: PropTypes.bool,
    decorator: PropTypes.func,
    disabled: PropTypes.bool,
    fallback: PropTypes.string,
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
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    ]),
    withCustom: PropTypes.bool,
};

export default Select;
