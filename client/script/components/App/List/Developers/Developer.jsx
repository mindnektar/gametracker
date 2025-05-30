import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'atoms/IconButton';
import TextList from 'atoms/TextList';
import ListItem from 'molecules/ListItem';
import PopupDialog from 'molecules/PopupDialog';

const Developer = (props) => {
    const games = props.games.filter(({ developer }) => developer.id === props.developer.id);

    const editDeveloper = () => {
        props.openDeveloperEditor(props.developer.id);
    };

    const deleteDeveloper = () => {
        props.deleteDeveloper(props.developer.id);
    };

    const toggleExpanded = () => {
        props.toggleExpanded(props.developer.id);
    };

    const renderHead = () => (
        <div className="system__name">
            {props.developer.name}

            <span className="system__game-count">
                ({games.length} game{games.length !== 1 ? 's' : ''})
            </span>
        </div>
    );

    const renderActions = () => (
        <PopupDialog
            items={[{
                icon: 'edit',
                label: 'Edit developer',
                onClick: editDeveloper,
            }, {
                icon: 'delete',
                label: 'Delete developer',
                onClick: deleteDeveloper,
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
            key={props.developer.id}
            head={renderHead()}
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

Developer.propTypes = {
    developer: PropTypes.object.isRequired,
    openDeveloperEditor: PropTypes.func.isRequired,
    deleteDeveloper: PropTypes.func.isRequired,
    games: PropTypes.array.isRequired,
    expanded: PropTypes.bool.isRequired,
    toggleExpanded: PropTypes.func.isRequired,
};

export default Developer;
