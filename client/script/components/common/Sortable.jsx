import React, { useState, useRef, useMemo } from 'react';
import { flushSync } from 'react-dom';
import PropTypes from 'prop-types';
import SortableContext from 'contexts/sortable';
import findPropertyInChildren from 'helpers/findPropertyInChildren';
import findScrollParent from 'helpers/findScrollParent';
import useStateWithRef from 'hooks/useStateWithRef';
import Item from './Sortable/Item';
import Handle from './Sortable/Handle';

// magic distance. we should accept small drag as click to
// prevent people from accidentally triggering drag when clicking
const MAX_DRAG_FOR_CLICK = 32;

const Sortable = (props) => {
    const rootRef = useRef();
    const originalXRef = useRef(0);
    const originalYRef = useRef(0);
    const dragDistance = useRef(0);
    const [draggingIndex, setDraggingIndex, draggingIndexRef] = useStateWithRef(null);
    const [droppingIndex, setDroppingIndex, droppingIndexRef] = useStateWithRef(null);
    const [dropping, setDropping] = useState(false);
    const clientXRef = useRef();
    const clientYRef = useRef();
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [draggables, setDraggables, draggablesRef] = useStateWithRef(null);
    const scrollParentRef = useRef();
    const scrollAnimationRef = useRef();
    const scrollTopRef = useRef();

    const handleScroll = () => {
        const scrollDistance = scrollTopRef.current - scrollParentRef.current.scrollPosition();

        originalYRef.current += scrollDistance;

        setDraggables((previous) => (
            previous?.map((item) => (
                item ? (
                    {
                        ...item,
                        bottom: item.bottom + scrollDistance,
                        top: item.top + scrollDistance,
                    }
                ) : (
                    null
                )
            ))
        ));
    };

    const onDragStartHandler = (index) => (event) => {
        setDraggables((
            Array
                .from(rootRef.current.querySelectorAll('.draggable'))
                .map((item, itemIndex) => {
                    if (!item.querySelector('.sortable-handle')) {
                        return null;
                    }

                    const rect = item.getBoundingClientRect();
                    const borderRadius = findPropertyInChildren(item.firstChild, 'borderRadius');
                    const boxShadow = findPropertyInChildren(item.firstChild, 'boxShadow');

                    return {
                        index: itemIndex,
                        bottom: rect.bottom,
                        offsetLeft: item.offsetLeft,
                        offsetTop: item.offsetTop,
                        height: rect.height,
                        left: rect.left,
                        right: rect.right,
                        top: rect.top,
                        width: rect.width,
                        borderRadius,
                        boxShadow,
                    };
                })
        ));
        setDraggingIndex(index);
        setDroppingIndex(index);

        originalXRef.current = event.touches ? event.touches[0].clientX : event.clientX;
        originalYRef.current = event.touches ? event.touches[0].clientY : event.clientY;
        scrollParentRef.current = findScrollParent(event.currentTarget);
        scrollTopRef.current = scrollParentRef.current.scrollPosition();
        dragDistance.current = 0;

        scrollParentRef.current.addEventListener('scroll', handleScroll);
    };

    const handleDrag = () => {
        const distanceFromTop = scrollParentRef.current.top() - (clientYRef.current - 60);
        const distanceFromBottom = scrollParentRef.current.bottom() - (clientYRef.current + 60);
        let scrollSpeed = 0;

        if (distanceFromTop > 0) {
            scrollSpeed = distanceFromTop / 4;
        } else if (distanceFromBottom < 0) {
            scrollSpeed = distanceFromBottom / 4;
        }

        scrollTopRef.current = scrollParentRef.current.scrollPosition();
        scrollParentRef.current.scroll(-scrollSpeed);

        const scrollOffset = (scrollTopRef.current - scrollParentRef.current.scrollPosition()) * 2;
        const nextX = clientXRef.current - originalXRef.current;
        const nextY = clientYRef.current - originalYRef.current - scrollOffset;

        dragDistance.current = dragDistance.current + Math.abs(nextX) + Math.abs(nextY);

        setOffsetX(clientXRef.current - originalXRef.current);
        setOffsetY(clientYRef.current - originalYRef.current - scrollOffset);

        const newIndex = draggablesRef.current.findIndex((draggable) => (
            draggable
            && clientXRef.current >= draggable.left
            && clientXRef.current <= draggable.right
            && clientYRef.current >= draggable.top
            && clientYRef.current <= draggable.bottom
        ));

        if (newIndex >= 0) {
            setDroppingIndex(newIndex);
        }

        scrollAnimationRef.current = window.requestAnimationFrame(handleDrag);
    };

    const onDrag = (event) => {
        clientXRef.current = event.touches ? event.touches[0].clientX : event.clientX;
        clientYRef.current = event.touches ? event.touches[0].clientY : event.clientY;

        if (!scrollAnimationRef.current) {
            handleDrag();
        }
    };

    const onDragEnd = () => {
        scrollAnimationRef.current = window.cancelAnimationFrame(scrollAnimationRef.current);

        const oldIndex = draggingIndexRef.current;
        const newIndex = droppingIndexRef.current;
        const shiftX = newIndex > oldIndex ? draggablesRef.current[newIndex].width - draggablesRef.current[oldIndex].width : 0;
        const shiftY = newIndex > oldIndex ? draggablesRef.current[newIndex].height - draggablesRef.current[oldIndex].height : 0;

        setDropping(true);
        setOffsetX(draggablesRef.current[newIndex].left - draggablesRef.current[oldIndex].left + shiftX);
        setOffsetY(draggablesRef.current[newIndex].top - draggablesRef.current[oldIndex].top + shiftY);

        scrollParentRef.current.removeEventListener('scroll', handleScroll);

        window.setTimeout(() => {
            if (newIndex !== oldIndex) {
                props.onChange(newIndex, oldIndex);
            } else if (dragDistance.current <= MAX_DRAG_FOR_CLICK) {
                props.onClick?.(oldIndex);
            }

            flushSync(() => {
                setDraggingIndex(null);
                setDroppingIndex(null);
                setDropping(false);
                setOffsetX(0);
                setOffsetY(0);
                setDraggables(null);
            });
        }, 300);
    };

    const draggableStyleHandler = (index) => {
        if (
            draggingIndex !== null
            && droppingIndex !== null
            && index !== draggingIndex
        ) {
            if (!draggables[index]) {
                return null;
            }

            const originalRect = draggables[index];
            let targetRect;

            if (
                droppingIndex > draggingIndex
                && index <= droppingIndex
                && index > draggingIndex
            ) {
                targetRect = draggables[index - 1];
            } else if (
                droppingIndex < draggingIndex
                && index >= droppingIndex
                && index < draggingIndex
            ) {
                targetRect = draggables[index + 1];
            } else if (droppingIndex === draggingIndex) {
                targetRect = originalRect;

                return {
                    transform: `translate(${originalRect.left - originalRect.left}px, ${originalRect.top - originalRect.top}px)`,
                    transition: 'transform 300ms',
                    zIndex: 1,
                };
            } else {
                return {
                    transition: 'transform 300ms',
                    zIndex: 1,
                };
            }

            const shiftX = index > draggingIndex
                ? targetRect.width - draggables[draggingIndex].width
                : draggables[draggingIndex].width - originalRect.width;
            const shiftY = index > draggingIndex
                ? targetRect.height - draggables[draggingIndex].height
                : draggables[draggingIndex].height - originalRect.height;

            return {
                transform: `translate(${targetRect.left - originalRect.left + shiftX}px, ${targetRect.top - originalRect.top + shiftY}px)`,
                transition: 'transform 300ms',
                zIndex: 1,
            };
        }

        if (index !== draggingIndex) {
            return null;
        }

        return {
            opacity: 0,
            zIndex: 2,
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            transition: dropping ? 'transform 300ms' : null,
        };
    };

    const placeholderStyleHandler = (draggable, index) => {
        const shiftX = index > draggingIndex ? draggable.width - draggables[draggingIndex].width : 0;
        const shiftY = index > draggingIndex ? draggable.height - draggables[draggingIndex].height : 0;

        return {
            height: draggables[draggingIndex].height,
            left: draggable.offsetLeft + shiftX,
            opacity: index === droppingIndex ? 1 : 0,
            width: draggable.width,
            top: draggable.offsetTop + shiftY,
            borderRadius: draggable.borderRadius,
        };
    };

    const contextValue = useMemo(() => ({
        dropping,
        draggedItem: draggables?.[draggingIndex],
        ignoreSelector: props.ignoreSelector,
        onDrag,
        onDragEnd,
        onDragStartHandler,
        draggableStyleHandler,
    }), [dropping, props.ignoreSelector, onDrag, onDragEnd, onDragStartHandler, draggableStyleHandler]);

    return (
        <div
            ref={rootRef}
            className="sortable"
        >
            {draggables && draggables.map((draggable, index) => (
                draggable ? (
                    <div
                        key={index}
                        className="sortable__placeholder"
                        style={placeholderStyleHandler(draggable, index)}
                    />
                ) : (
                    null
                )
            ))}

            <SortableContext.Provider value={contextValue}>
                {props.children}
            </SortableContext.Provider>
        </div>
    );
};

Sortable.defaultProps = {
    handle: null,
    ignoreSelector: null,
    onClick: null,
};

Sortable.propTypes = {
    children: PropTypes.node.isRequired,
    handle: PropTypes.string,
    ignoreSelector: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onClick: PropTypes.func,
};

Sortable.Item = Item;
Sortable.Handle = Handle;

export default Sortable;
