import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'atoms/IconButton';
import TextList from 'atoms/TextList';
import ListItem from 'molecules/ListItem';
import PopupDialog from 'molecules/PopupDialog';

const Compilation = (props) => {
    const games = props.games.filter(({ compilation }) => compilation?.id === props.compilation.id);

    const editCompilation = () => {
        props.openCompilationEditor(props.compilation.id);
    };

    const deleteCompilation = () => {
        props.deleteCompilation(props.compilation.id);
    };

    const toggleExpanded = () => {
        props.toggleExpanded(props.compilation.id);
    };

    const renderHead = () => (
        <div className="system__name">
            {props.compilation.title}

            <span className="system__game-count">
                ({games.length} game{games.length !== 1 ? 's' : ''})
            </span>
        </div>
    );

    const renderActions = () => (
        <PopupDialog
            items={[{
                icon: 'edit',
                label: 'Edit compilation',
                onClick: editCompilation,
            }, {
                icon: 'delete',
                label: 'Delete compilation',
                onClick: deleteCompilation,
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
            key={props.compilation.id}
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

Compilation.propTypes = {
    compilation: PropTypes.object.isRequired,
    openCompilationEditor: PropTypes.func.isRequired,
    deleteCompilation: PropTypes.func.isRequired,
    games: PropTypes.array.isRequired,
    expanded: PropTypes.bool.isRequired,
    toggleExpanded: PropTypes.func.isRequired,
};

export default Compilation;
