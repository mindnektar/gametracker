import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import SortableContext from 'contexts/sortable';
import Icon from 'atoms/Icon';
import Collapsible from 'molecules/Collapsible';
import Sortable from 'Sortable';

const ListItem = (props) => {
    const sortable = useContext(SortableContext);

    return (
        <div
            className={classnames(
                'ui-list-item',
                {
                    'ui-list-item--expanded': props.expanded,
                    'ui-list-item--planned': props.status === 'planned',
                    'ui-list-item--active': props.status === 'active',
                    'ui-list-item--dropped': props.status === 'dropped',
                    'ui-list-item--completed': props.status === 'completed',
                }
            )}
            {...props.dataProps}
        >
            {props.status && (
                <div className="ui-list-item__status" />
            )}

            <div className="ui-list-item__content">
                <div
                    className="ui-list-item__head"
                    onClick={props.toggleExpanded}
                >
                    {sortable && (
                        <Sortable.Handle>
                            <Icon type="drag_handle" />
                        </Sortable.Handle>
                    )}

                    {props.head}

                    {props.actions && (
                        <div className="ui-list-item__actions">
                            {props.actions}
                        </div>
                    )}
                </div>

                <Collapsible collapsed={!props.expanded}>
                    {props.children}
                </Collapsible>
            </div>
        </div>
    );
};

ListItem.defaultProps = {
    dataProps: {},
    status: null,
    actions: null,
};

ListItem.propTypes = {
    dataProps: PropTypes.object,
    children: PropTypes.node.isRequired,
    expanded: PropTypes.bool.isRequired,
    head: PropTypes.node.isRequired,
    toggleExpanded: PropTypes.func.isRequired,
    status: PropTypes.string,
    actions: PropTypes.node,
};

export default ListItem;
