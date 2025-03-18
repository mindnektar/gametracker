import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Draggable = (props) => {
    const containerRef = useRef();
    const isDraggingRef = useRef(false);

    // Need to attach the events like this because this is the only way to add them
    // non-passively in react, and that is necessary because otherwise we can't prevent
    // background scrolling on iOS >= 11.3
    useEffect(() => {
        containerRef.current?.addEventListener('touchstart', onDragStart, { passive: false });

        return () => containerRef.current?.removeEventListener('touchstart', onDragStart);
    }, [props.onDragStart]);

    useEffect(() => {
        containerRef.current?.addEventListener('touchmove', onDrag, { passive: false });

        return () => containerRef.current?.removeEventListener('touchmove', onDrag);
    }, [props.onDrag]);

    useEffect(() => {
        containerRef.current?.addEventListener('touchend', onDragEnd, { passive: false });

        return () => containerRef.current?.removeEventListener('touchend', onDragEnd);
    }, [props.onDragEnd]);

    const shouldIgnore = (element) => {
        if (!props.ignoreSelector || !element.parentNode) {
            return false;
        }

        return element.matches(props.ignoreSelector) || shouldIgnore(element.parentNode);
    };

    const isHandle = (element) => {
        if (!props.handle) {
            return true;
        }

        if (!element.parentNode) {
            return false;
        }

        return element.matches(props.handle) || isHandle(element.parentNode);
    };

    const onDragStart = (event) => {
        if (shouldIgnore(event.target) || !isHandle(event.target)) {
            return;
        }

        if (props.preventDefault) {
            event.preventDefault();
        }

        isDraggingRef.current = true;

        props.onDragStart(event);
    };

    const onDrag = (event) => {
        if (shouldIgnore(event.target) || !isDraggingRef.current) {
            return;
        }

        if (props.preventDefault) {
            event.preventDefault();
        }

        props.onDrag(event);
    };

    const onDragEnd = (event) => {
        if (shouldIgnore(event.target) || !isDraggingRef.current) {
            return;
        }

        if (props.preventDefault) {
            event.preventDefault();
        }

        isDraggingRef.current = false;

        props.onDragEnd(event);
    };

    const onMouseDown = (event) => {
        if (shouldIgnore(event.target) || !isHandle(event.target)) {
            return;
        }

        if (props.preventDefault) {
            event.preventDefault();
        }

        isDraggingRef.current = true;

        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);

        props.onDragStart(event);
    };

    const onMouseMove = (event) => {
        if (shouldIgnore(event.target) || !isDraggingRef.current) {
            return;
        }

        if (props.preventDefault) {
            event.preventDefault();
        }

        props.onDrag(event);
    };

    const onMouseUp = (event) => {
        if (shouldIgnore(event.target) || !isDraggingRef.current) {
            return;
        }

        if (props.preventDefault) {
            event.preventDefault();
        }

        isDraggingRef.current = false;

        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);

        props.onDragEnd(event);
    };

    return (
        <div
            ref={containerRef}
            className={classNames(
                'draggable',
                { 'draggable--disabled': props.disabled },
            )}
            onMouseDown={onMouseDown}
            style={props.style}
        >
            {props.children}
        </div>
    );
};

Draggable.defaultProps = {
    disabled: false,
    handle: null,
    ignoreSelector: null,
    onDrag: () => null,
    onDragEnd: () => null,
    onDragStart: () => null,
    preventDefault: true,
    style: null,
};

Draggable.propTypes = {
    children: PropTypes.node.isRequired,
    disabled: PropTypes.bool,
    handle: PropTypes.string,
    ignoreSelector: PropTypes.string,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDragStart: PropTypes.func,
    preventDefault: PropTypes.bool,
    style: PropTypes.object,
};

export default Draggable;
