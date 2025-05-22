import React, { useRef, useState, useLayoutEffect, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { CSSTransition } from 'react-transitioning';
import findScrollParent from 'helpers/findScrollParent';
import useResizeObserver from 'hooks/useResizeObserver';
import useToggle from 'hooks/useToggle';
import useEffectWithoutMount from 'hooks/useEffectWithoutMount';

const SpeechBubble = forwardRef((props, ref) => {
    const [style, setStyle] = useState(null);
    const [contentHeight, setContentHeight] = useState(null);
    const [caretOffset, setCaretOffset] = useState(0);
    const [isBottomCaret, setIsBottomCaret] = useState(false);
    const [rotated, setRotated] = useState(false);
    const [isFocused, focus, unfocus] = useToggle(false);
    const popupRef = useRef();
    const rootRef = useRef();
    const backgroundRef = useRef();
    const caretStyle = rotated
        ? `translate(${caretOffset + 4}px, -4px) rotate(-60deg) scale(1.2)`
        : `translateX(${caretOffset}px) rotate(-45deg)`;

    useImperativeHandle(ref, () => ({
        calculatePosition,
    }));

    useEffectWithoutMount(() => {
        if (!props.withOverlay) {
            return;
        }

        if (props.isOpen) {
            focus();
        } else {
            window.setTimeout(() => {
                unfocus();
            }, 300);
        }
    }, [props.isOpen]);

    useLayoutEffect(() => {
        let scrollParent;

        window.requestAnimationFrame(() => {
            scrollParent = findScrollParent(rootRef.current);

            calculatePosition();
            scrollParent.addEventListener('scroll', calculatePosition);
            window.addEventListener('resize', calculatePosition);
            window.addEventListener('mousedown', onOutsideClick);
        });

        return () => {
            scrollParent?.removeEventListener('scroll', calculatePosition);
            window.removeEventListener('resize', calculatePosition);
            window.removeEventListener('mousedown', onOutsideClick);
        };
    }, [props.isOpen]);

    const anchorElement = () => (
        props.anchorSelector
            ? rootRef.current.nextElementSibling.querySelector(props.anchorSelector)
            : rootRef.current.nextElementSibling
    );

    const calculatePosition = () => {
        if (!props.isOpen || !backgroundRef.current) {
            return;
        }

        const originRect = anchorElement().getBoundingClientRect();
        const backgroundNode = backgroundRef.current;
        const offsetWidth = backgroundNode?.offsetWidth || 0;
        const offsetHeight = backgroundNode?.offsetHeight || 0;
        const popupLeft = (originRect.left + (originRect.width / 2)) - (offsetWidth / 2);
        const popupTop = originRect.bottom + props.offset + 24;
        const maxLeft = window.innerWidth - offsetWidth - 8;
        const maxTop = window.innerHeight - 120;
        const left = Math.min(Math.max(8, popupLeft), maxLeft);
        const aboveAnchorPosition = originRect.top - offsetHeight - props.offset - 24;
        const isPopupAboveAnchor = popupTop > maxTop && aboveAnchorPosition > 8;
        const top = Math.max(24, Math.min(maxTop - 16, isPopupAboveAnchor ? aboveAnchorPosition : popupTop));
        const height = isPopupAboveAnchor ? offsetHeight : Math.min(offsetHeight, window.innerHeight - popupTop - 8);
        let isRotated = false;

        setIsBottomCaret(isPopupAboveAnchor);
        setStyle({ left, top });
        setContentHeight(height);

        if (popupLeft > maxLeft) {
            setCaretOffset(Math.min(popupLeft - maxLeft, offsetWidth / 2 - 28));

            const diff = popupLeft - maxLeft - (offsetWidth / 2 - 28);

            if (diff > 0) {
                isRotated = true;
            }
        } else if (popupLeft < 8) {
            setCaretOffset(popupLeft - 8);
        } else {
            setCaretOffset(0);
        }

        setRotated(isRotated);
    };

    const onOutsideClick = (event) => {
        if (!rootRef.current || anchorElement().contains(event.target) || popupRef.current?.contains(event.target)) {
            return;
        }

        props.close();
    };

    useResizeObserver(backgroundRef, calculatePosition, [props.isOpen]);

    return (
        <>
            <div
                ref={rootRef}
                className={classnames(
                    'ui-speech-bubble',
                    {
                        'ui-speech-bubble--open': props.isOpen,
                        'ui-speech-bubble--focused': isFocused,
                    },
                )}
            >
                {props.withOverlay && (
                    <div className="ui-speech-bubble__overlay" />
                )}

                {createPortal(
                    <CSSTransition
                        classNames="ui-speech-bubble__wrapper-"
                        in={props.isOpen}
                        timeout={300}
                    >
                        <div
                            ref={popupRef}
                            className={classnames(
                                'ui-speech-bubble__wrapper',
                                props.className,
                            )}
                            style={style}
                        >
                            <div className="ui-speech-bubble__additional-content">
                                {props.additionalContent({ close: props.close })}
                            </div>

                            <div
                                className={classnames(
                                    'ui-speech-bubble__caret',
                                    {
                                        'ui-speech-bubble__caret--bottom': isBottomCaret,
                                        'ui-speech-bubble__caret--rotated': rotated,
                                    },
                                )}
                                style={{ transform: caretStyle }}
                            />

                            <div
                                className="ui-speech-bubble__content"
                                style={{ height: contentHeight }}
                            >
                                <div
                                    ref={backgroundRef}
                                    className="ui-speech-bubble__background"
                                >
                                    {props.content}
                                </div>
                            </div>
                        </div>
                    </CSSTransition>,
                    document.body,
                )}
            </div>

            {props.children}
        </>
    );
});

SpeechBubble.defaultProps = {
    additionalContent: () => null,
    anchorSelector: null,
    className: null,
    offset: 0,
    withOverlay: false,
};

SpeechBubble.propTypes = {
    additionalContent: PropTypes.func,
    anchorSelector: PropTypes.string,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    close: PropTypes.func.isRequired,
    content: PropTypes.node.isRequired,
    isOpen: PropTypes.bool.isRequired,
    offset: PropTypes.number,
    withOverlay: PropTypes.bool,
};

export default SpeechBubble;
