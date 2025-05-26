import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const DragHelper = (props) => (
    createPortal(
        <div
            className="sortable-item-drag-helper"
            style={{
                top: props.draggedItem.top,
                left: props.draggedItem.left,
                width: props.draggedItem.width,
                height: props.draggedItem.height,
            }}
        >
            <div
                className="sortable-item-drag-helper__movable"
                style={{
                    ...props.style,
                    borderRadius: props.draggedItem.borderRadius,
                    boxShadow: props.draggedItem.boxShadow ? 'none' : undefined,
                    opacity: 1,
                }}

            >
                {props.children}
            </div>
        </div>,
        document.body,
    )
);

DragHelper.propTypes = {
    children: PropTypes.node.isRequired,
    draggedItem: PropTypes.object.isRequired,
    style: PropTypes.object.isRequired,
};

export default DragHelper;
