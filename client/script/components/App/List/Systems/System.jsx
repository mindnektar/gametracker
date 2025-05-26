import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'atoms/IconButton';
import TextList from 'atoms/TextList';
import ListItem from 'molecules/ListItem';
import PopupDialog from 'molecules/PopupDialog';

const System = (props) => {
    const games = props.games.filter(({ system }) => system.id === props.system.id);

    const editSystem = () => {
        props.openSystemEditor(props.system.id);
    };

    const deleteSystem = () => {
        props.deleteSystem(props.system.id);
    };

    const toggleExpanded = () => {
        props.toggleExpanded(props.system.id);
    };

    const renderHead = () => (
        <div className="system__name">
            {props.system.name}

            <span className="system__game-count">
                ({games.length} game{games.length !== 1 ? 's' : ''})
            </span>
        </div>
    );

    const renderActions = () => (
        <PopupDialog
            items={[{
                icon: 'edit',
                label: 'Edit system',
                onClick: editSystem,
            }, {
                icon: 'delete',
                label: 'Delete system',
                onClick: deleteSystem,
            }]}
        >
            {({ toggle }) => (
                <IconButton
                    type="more_horiz"
                    onClick={toggle}
                />
            )}
        </PopupDialog>
    );

    return (
        <ListItem
            key={props.system.id}
            head={renderHead()}
            status={props.system.status}
            actions={renderActions()}
            expanded={props.expanded}
            toggleExpanded={toggleExpanded}
        >
            <TextList
                items={games.map(({ title }) => title)}
                title="Games"
            />
        </ListItem>
    );
};

System.propTypes = {
    system: PropTypes.object.isRequired,
    openSystemEditor: PropTypes.func.isRequired,
    deleteSystem: PropTypes.func.isRequired,
    games: PropTypes.array.isRequired,
    expanded: PropTypes.bool.isRequired,
    toggleExpanded: PropTypes.func.isRequired,
};

export default System;
