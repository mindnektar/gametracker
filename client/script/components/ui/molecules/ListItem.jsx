import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import SortableContext from 'contexts/sortable';
import statusMap from 'helpers/statusMap';
import Icon from 'atoms/Icon';
import Tooltip from 'atoms/Tooltip';
import Collapsible from 'molecules/Collapsible';
import Sortable from 'Sortable';

const ListItem = (props) => {
    const sortable = useContext(SortableContext);

    const renderStatus = () => (
        <div className="ui-list-item__status-inner">
            <Icon type={statusMap[props.status].icon} />
        </div>
    );

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
                <div
                    className="ui-list-item__status"
                    style={{ color: statusMap[props.status].iconColor }}
                >
                    {props.statusTooltip ? (
                        <Tooltip content={props.statusTooltip}>
                            {renderStatus()}
                        </Tooltip>
                    ) : (
                        renderStatus()
                    )}
                </div>
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
    statusTooltip: null,
    actions: null,
};

ListItem.propTypes = {
    dataProps: PropTypes.object,
    children: PropTypes.node.isRequired,
    expanded: PropTypes.bool.isRequired,
    head: PropTypes.node.isRequired,
    toggleExpanded: PropTypes.func.isRequired,
    status: PropTypes.string,
    statusTooltip: PropTypes.string,
    actions: PropTypes.node,
};

export default ListItem;
