import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'atoms/IconButton';
import TextList from 'atoms/TextList';
import ListItem from 'molecules/ListItem';
import PopupDialog from 'molecules/PopupDialog';

const Genre = (props) => {
    const games = props.games.filter(({ genres }) => genres.some(({ id }) => id === props.genre.id));

    const editGenre = () => {
        props.openGenreEditor(props.genre.id);
    };

    const deleteGenre = () => {
        props.deleteGenre(props.genre.id);
    };

    const toggleExpanded = () => {
        props.toggleExpanded(props.genre.id);
    };

    const renderHead = () => (
        <div className="system__name">
            {props.genre.name}

            <span className="system__game-count">
                ({games.length} game{games.length !== 1 ? 's' : ''})
            </span>
        </div>
    );

    const renderActions = () => (
        <PopupDialog
            items={[{
                icon: 'edit',
                label: 'Edit genre',
                onClick: editGenre,
            }, {
                icon: 'delete',
                label: 'Delete genre',
                onClick: deleteGenre,
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
            key={props.genre.id}
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

Genre.propTypes = {
    genre: PropTypes.object.isRequired,
    openGenreEditor: PropTypes.func.isRequired,
    deleteGenre: PropTypes.func.isRequired,
    games: PropTypes.array.isRequired,
    expanded: PropTypes.bool.isRequired,
    toggleExpanded: PropTypes.func.isRequired,
};

export default Genre;
