import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Draggable = (props) => {
    const isMouseDown = useRef(false);
    const [hasMoved, setHasMoved] = useState(false);
    const containerRef = useRef();

    useEffect(() => {
        // Need to attach the events like this because this is the only way to add them
        // non-passively in react, and that is necessary because otherwise we can't prevent
        // background scrolling on iOS >= 11.3
        containerRef.current.addEventListener('touchstart', onDragStart, { passive: false });
        containerRef.current.addEventListener('touchmove', onDrag, { passive: false });
        containerRef.current.addEventListener('touchend', onDragEnd, { passive: false });

        return () => {
            if (!containerRef.current) {
                return;
            }

            containerRef.current.removeEventListener('touchstart', onDragStart);
            containerRef.current.removeEventListener('touchmove', onDrag);
            containerRef.current.removeEventListener('touchend', onDragEnd);
        };
    }, []);

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

        event.preventDefault();

        setHasMoved(false);
        props.onDragStart(event);
    };

    const onDrag = (event) => {
        if (shouldIgnore(event.target) || !isHandle(event.target)) {
            return;
        }

        event.preventDefault();

        if (event.type === 'mousemove' && !isMouseDown.current) {
            return;
        }

        setHasMoved(true);
        props.onDrag(event);
    };

    const onDragEnd = (event) => {
        if (shouldIgnore(event.target) || !isHandle(event.target)) {
            return;
        }

        props.onDragEnd(event);
    };

    const onMouseDown = (event) => {
        if (shouldIgnore(event.target) || !isHandle(event.target)) {
            return;
        }

        event.preventDefault();

        isMouseDown.current = true;

        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);

        setHasMoved(false);
        props.onDragStart(event);
    };

    const onMouseMove = (event) => {
        if (!isMouseDown.current) {
            return;
        }

        event.preventDefault();

        setHasMoved(true);
        props.onDrag(event);
    };

    const onMouseUp = (event) => {
        isMouseDown.current = false;

        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);

        props.onDragEnd(event);
    };

    const onClick = (event) => {
        if (hasMoved) {
            event.stopPropagation();
        }
    };

    return (
        <div
            className={classNames(
                'draggable',
                { 'draggable--disabled': props.disabled }
            )}
            onMouseDown={onMouseDown}
            ref={containerRef}
            style={props.style}
            onClick={onClick}
        >
            {props.children}
        </div>
    );
};

Draggable.defaultProps = {
    onDragStart: () => null,
    onDrag: () => null,
    onDragEnd: () => null,
    style: null,
    disabled: false,
    ignoreSelector: null,
    handle: null,
};

Draggable.propTypes = {
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    children: PropTypes.node.isRequired,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    ignoreSelector: PropTypes.string,
    handle: PropTypes.string,
};

export default Draggable;
