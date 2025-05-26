import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import SortableContext from 'contexts/sortable';
import Draggable from 'Draggable';
import DragHelper from './Item/DragHelper';

const Item = (props) => {
    const sortable = useContext(SortableContext);
    const style = sortable.draggableStyleHandler(props.index);

    return (
        <>
            <Draggable
                ariaLabel={props.ariaLabel}
                disabled={sortable.dropping}
                handle=".sortable-handle"
                ignoreSelector={sortable.ignoreSelector}
                onDrag={sortable.onDrag}
                onDragEnd={sortable.onDragEnd}
                onDragStart={sortable.onDragStartHandler(props.index)}
                role="listitem"
                style={style}
            >
                {props.children}
            </Draggable>

            {sortable.draggedItem?.index === props.index && (
                <DragHelper
                    draggedItem={sortable.draggedItem}
                    style={style}
                >
                    {props.children}
                </DragHelper>
            )}
        </>
    );
};

Item.defaultProps = {
    ariaLabel: null,
};

Item.propTypes = {
    ariaLabel: PropTypes.string,
    children: PropTypes.node.isRequired,
    index: PropTypes.number.isRequired,
};

export default Item;
