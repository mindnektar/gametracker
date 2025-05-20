import React, { useState, useEffect, useRef, startTransition } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import animateScrollTo from 'animated-scroll-to';
import moment from 'moment';
import ModalContext from 'contexts/modal';
import { findDeep } from 'helpers/objects';
import findReactChildren from 'helpers/findReactChildren';
import useRepeatFor from 'hooks/useRepeatFor';
import useFormReducer from 'hooks/useFormReducer';
import useKeyHandlers from 'hooks/useKeyHandlers';
import Button from 'atoms/Button';
import Loader from 'atoms/Loader';
import Collapsible from 'molecules/Collapsible';
import Screen from './Modal/Screen';

const Modal = (props) => {
    const [exitingScreen, setExitingScreen] = useState(null);
    const [activeScreen, setActiveScreen] = useState(0);
    const [loading, setLoading] = useState(props.loading);
    const [errors, setErrors] = useState({});
    const [unhandledErrors, setUnhandledErrors] = useState(null);
    const [lastConfirmationTime, setLastConfirmationTime] = useState(null);
    const bodyRef = useRef();
    const validatorsRef = useRef({});
    const confirmCallbackRef = useRef(props.onConfirm);
    const [formValues, setFormValue, formValuesRef] = useFormReducer({
        subject: props.formSubject,
        dependsOn: [props.isOpen, props.formSubject?.id],
        config: props.formConfig,
    });
    const repeat = useRepeatFor(300);
    const screens = findReactChildren(props.children, { formValues, setFormValue });
    const visibleScreen = exitingScreen ?? activeScreen;
    const isLastScreen = visibleScreen === screens.length - 1;

    useEffect(() => {
        setLoading(props.loading);
    }, [props.loading]);

    useEffect(() => {
        if (!props.isOpen) {
            setActiveScreen(0);
            setErrors({});
            setUnhandledErrors(null);
        }
    }, [props.isOpen]);

    useEffect(() => {
        if (activeScreen !== null) {
            window.setTimeout(focusFirstInput, 300);
        }
    }, [activeScreen, props.isOpen]);

    useEffect(() => {
        confirmCallbackRef.current = props.onConfirm;
    }, [props.onConfirm]);

    useEffect(() => {
        window.setTimeout(() => {
            const errorElement = bodyRef.current?.querySelector('.ui-error__message');

            if (errorElement) {
                scrollTo(errorElement);
            }
        }, 1);
    }, [lastConfirmationTime]);

    const scrollTo = (element) => {
        const verticalOffset = 40;

        repeat(() => {
            if (!bodyRef.current) {
                return;
            }

            if (
                bodyRef.current.scrollTop > element.offsetTop - verticalOffset
                || bodyRef.current.offsetHeight + bodyRef.current.scrollTop < element.offsetTop + element.offsetHeight + verticalOffset
            ) {
                animateScrollTo(
                    element,
                    {
                        maxDuration: 300,
                        verticalOffset: -verticalOffset,
                        cancelOnUserAction: false,
                        elementToScroll: bodyRef.current,
                    },
                );
            }
        });
    };

    const focusFirstInput = () => {
        if (!bodyRef.current) {
            return;
        }

        // A bit hacky but the least intrusive way to focus the first input field of each content screen
        const selector = ['input', 'textarea']
            .map((type) => `.ui-collapsible:nth-child(${activeScreen + 1}) ${type}:not([readonly]):not([disabled])`)
            .join(', ');
        const firstInput = bodyRef.current.querySelector(selector);

        if (firstInput && firstInput !== document.activeElement) {
            firstInput.select();
        }
    };

    const close = () => {
        props.close();
    };

    const confirm = async () => {
        if (activeScreen === null || loading) {
            return;
        }

        setLastConfirmationTime(moment().toISOString());

        const validationErrors = validateFrontendErrors();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);

            return;
        }

        if (isLastScreen) {
            const confirmPromise = confirmCallbackRef.current(formValuesRef.current);

            if (confirmPromise?.then) {
                setLoading(true);

                try {
                    await confirmPromise;
                } catch (validatingErrors) {
                    const [serverErrors, unhandledServerErrors] = validateServerErrors(validatingErrors);

                    setErrors(serverErrors);
                    setUnhandledErrors(unhandledServerErrors.length > 0 ? unhandledServerErrors : null);
                }

                setLoading(false);
            }
        } else {
            changeScreen(activeScreen + 1);
        }
    };

    const validateFrontendErrors = () => (
        Object.entries(validatorsRef.current).reduce((result, [validatorKey, { name, validators }]) => {
            for (let i = 0; i < validators.length; i += 1) {
                const { isValid, skip, serverError } = validators[i];

                if (serverError || (skip && skip(formValuesRef.current))) {
                    continue;
                }

                const validatorData = {
                    input: formValuesRef.current,
                    name,
                    value: findDeep(formValuesRef.current, name),
                };

                if (!isValid(validatorData)) {
                    return { ...result, [validatorKey]: validators[i] };
                }
            }

            return result;
        }, {})
    );

    const validateServerErrors = (validatingErrors) => {
        if (!validatingErrors.graphQLErrors && !validatingErrors.isAxiosError) {
            throw validatingErrors;
        }

        let serverErrors = {};
        let errorScreen = null;

        if (validatorsRef.current) {
            Object.entries(validatorsRef.current).forEach(([validatorKey, { name, validators, screen }]) => {
                validators.forEach((validator) => {
                    if (validator.serverError && Object.keys(serverErrors).length === 0) {
                        validatingErrors.graphQLErrors?.forEach((error) => {
                            const validatorData = {
                                input: formValuesRef.current,
                                name,
                                value: findDeep(formValuesRef.current, name),
                                data: error.extensions.data,
                            };

                            if (
                                validator.serverError === error.extensions.code
                                && (!validator.isValid || !validator.isValid(validatorData))
                            ) {
                                serverErrors = {
                                    ...serverErrors,
                                    [validatorKey]: {
                                        ...validator,
                                        data: error.extensions.data,
                                    },
                                };
                            }
                        });

                        if (validatingErrors.isAxiosError) {
                            let error;

                            if (validatingErrors.config.responseType === 'arraybuffer') {
                                error = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(validatingErrors.response.data)));
                            } else if (validatingErrors.config.responseType === 'json') {
                                error = validatingErrors.response.data;
                            } else {
                                error = {
                                    message: validatingErrors.message,
                                };
                            }

                            const validatorData = {
                                input: formValuesRef.current,
                                name,
                                value: findDeep(formValuesRef.current, name),
                                data: error.extensions.data,
                            };

                            if (
                                validator.serverError === error.extensions.code
                                && (!validator.isValid || !validator.isValid(validatorData))
                            ) {
                                serverErrors = {
                                    ...serverErrors,
                                    [validatorKey]: {
                                        ...validator,
                                        data: error.extensions.data,
                                    },
                                };
                            }
                        }

                        if (Object.keys(serverErrors).length > 0) {
                            errorScreen = screen;
                        }
                    }
                });
            });
        }

        if (errorScreen !== null && errorScreen !== activeScreen) {
            changeScreen(errorScreen);
        }

        const unhandledServerErrors = validatingErrors.graphQLErrors?.filter((error) => (
            !Object.values(serverErrors).some(({ serverError }) => serverError === (error.extensions.code || error.message))
        ));

        return [serverErrors, unhandledServerErrors];
    };

    const previousScreen = () => {
        if (activeScreen === null) {
            return;
        }

        changeScreen(Math.max(0, activeScreen - 1));
    };

    const changeScreen = (value) => {
        setErrors({});
        setUnhandledErrors(null);

        startTransition(() => {
            setExitingScreen(activeScreen);
            setActiveScreen(null);

            window.setTimeout(() => {
                setExitingScreen(null);
                setActiveScreen(value);
            }, 300);
        });
    };

    const modalContextValueHandler = (screen) => ({
        activeScreen,
        confirm,
        errors,
        formValues,
        setFormValue,
        scrollTo,
        setLoading,
        setErrorMessageHandler: (key) => (message) => {
            setErrors((previous) => ({
                ...previous,
                [key]: {
                    message,
                    alwaysShow: true,
                },
            }));
        },
        registerValidators: (name, validators, validatorKey = name) => {
            if (validators) {
                validatorsRef.current[validatorKey] = {
                    screen,
                    name,
                    validators: [
                        ...(validatorsRef.current[validatorKey]?.validators || []),
                        ...validators.filter(({ available, message, serverError }) => (
                            available !== false
                            && !validatorsRef.current[validatorKey]?.validators.some((validator) => (
                                (validator.message && message === validator.message)
                                || (validator.serverError && serverError === validator.serverError)
                            ))
                        )),
                    ],
                };
            }
        },
        deregisterFrontendValidators: (validatorKey) => {
            if (validatorsRef.current[validatorKey]) {
                validatorsRef.current[validatorKey].validators = (
                    validatorsRef.current[validatorKey].validators.filter(({ serverError }) => !!serverError)
                );
            }
        },
    });

    useKeyHandlers({
        handlers: [{
            key: 'Escape',
            handler: close,
        }],
        active: props.isOpen,
    });

    const renderContent = () => (
        <div
            aria-label={screens[visibleScreen]?.props.headline}
            className={classNames(
                'ui-modal',
                {
                    'ui-modal--loading': loading,
                    'ui-modal--transitioning': activeScreen === null,
                    'ui-modal--white': screens[visibleScreen]?.props.white,
                },
            )}
            role="dialog"
        >
            <div className="ui-modal__container">
                <div className="ui-modal__overlay" />

                <div className="ui-modal__wrapper">
                    <div className="ui-modal__content">
                        <div className="ui-modal__header">
                            <TransitionGroup component={React.Fragment}>
                                {activeScreen !== null && (
                                    <CSSTransition
                                        classNames="ui-modal__header-content-"
                                        mountOnEnter
                                        timeout={400}
                                        unmountOnExit
                                    >
                                        <div className="ui-modal__header-content">
                                            <div className="ui-modal__header-text">
                                                {screens[visibleScreen]?.props.headline}
                                            </div>
                                        </div>
                                    </CSSTransition>
                                )}
                            </TransitionGroup>
                        </div>

                        <div
                            ref={bodyRef}
                            className={classNames(
                                'ui-modal__body',
                                { 'ui-modal__body--empty': !props.children },
                            )}
                        >
                            {screens.map((screen, index) => (
                                <Collapsible
                                    key={index}
                                    collapsed={index !== activeScreen}
                                >
                                    <ModalContext.Provider value={modalContextValueHandler(index)}>
                                        {screen}

                                        <Collapsible collapsed={!unhandledErrors}>
                                            <div className="ui-modal__unhandled-error">
                                                Leider ist ein Fehler aufgetreten. Bitte melden Sie ihn uns, damit wir ihn
                                                schnellstmöglich beheben können. Klicken Sie dazu auf den folgenden Button:
                                            </div>
                                        </Collapsible>
                                    </ModalContext.Provider>
                                </Collapsible>
                            ))}
                        </div>

                        <div className="ui-modal__loading">
                            <Loader />
                        </div>
                    </div>

                    <div className="ui-modal__buttons">
                        {visibleScreen > 0 && (
                            <Button
                                light
                                onClick={previousScreen}
                            >
                                Back
                            </Button>
                        )}

                        {props.onConfirm && (
                            <Button
                                onClick={confirm}
                            >
                                {isLastScreen ? 'Save' : 'Next'}
                            </Button>
                        )}
                    </div>
                </div>

                <div
                    className="ui-modal__close"
                    onClick={close}
                >
                    ✕
                </div>
            </div>
        </div>
    );

    return (
        <TransitionGroup component={React.Fragment}>
            {props.isOpen && (
                <CSSTransition
                    classNames="ui-modal-"
                    mountOnEnter
                    timeout={300}
                    unmountOnExit
                >
                    {renderContent()}
                </CSSTransition>
            )}
        </TransitionGroup>
    );
};

Modal.Screen = Screen;

Modal.defaultProps = {
    children: null,
    close: null,
    formConfig: null,
    formSubject: null,
    isOpen: false,
    loading: false,
    onConfirm: null,
};

Modal.propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    close: PropTypes.func,
    formConfig: PropTypes.object,
    formSubject: PropTypes.object,
    isOpen: PropTypes.bool,
    loading: PropTypes.bool,
    onConfirm: PropTypes.func,
};

export default Modal;
