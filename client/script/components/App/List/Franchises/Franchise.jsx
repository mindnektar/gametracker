import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'atoms/IconButton';
import TextList from 'atoms/TextList';
import ListItem from 'molecules/ListItem';
import PopupDialog from 'molecules/PopupDialog';

const Franchise = (props) => {
    const games = props.games.filter(({ franchises }) => franchises.some(({ id }) => id === props.franchise.id));

    const editFranchise = () => {
        props.openFranchiseEditor(props.franchise.id);
    };

    const deleteFranchise = () => {
        props.deleteFranchise(props.franchise.id);
    };

    const toggleExpanded = () => {
        props.toggleExpanded(props.franchise.id);
    };

    const renderHead = () => (
        <div className="system__name">
            {props.franchise.name}

            <span className="system__game-count">
                ({games.length} game{games.length !== 1 ? 's' : ''})
            </span>
        </div>
    );

    const renderActions = () => (
        <PopupDialog
            items={[{
                icon: 'edit',
                label: 'Edit franchise',
                onClick: editFranchise,
            }, {
                icon: 'delete',
                label: 'Delete franchise',
                onClick: deleteFranchise,
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
            key={props.franchise.id}
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

Franchise.propTypes = {
    franchise: PropTypes.object.isRequired,
    openFranchiseEditor: PropTypes.func.isRequired,
    deleteFranchise: PropTypes.func.isRequired,
    games: PropTypes.array.isRequired,
    expanded: PropTypes.bool.isRequired,
    toggleExpanded: PropTypes.func.isRequired,
};

export default Franchise;
