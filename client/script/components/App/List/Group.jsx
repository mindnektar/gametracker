import React from 'react';
import PropTypes from 'prop-types';
import Game from './Group/Game';

const Group = (props) => {
    const filterGames = () => {
        let games = [...props.games];

        if (props.genreFilter.length > 0) {
            games = games.filter((game) => (
                props.genreFilter.every((genreId) => (
                    game.genres.some(({ id }) => id === genreId)
                ))
            ));
        }

        return games.sort((a, b) => a.title.localeCompare(b.title));
    };

    const games = filterGames();

    if (games.length === 0) {
        return null;
    }

    return (
        <div className="group">
            <div className="group__header">
                <div className="group__label">
                    {props.name}
                </div>

                <div className="group__count">
                    {`${games.length} game${games.length !== 1 ? 's' : ''}`}
                </div>
            </div>

            {games.map((game) => (
                <Game
                    deleteGame={props.deleteGame}
                    expandGame={props.expandGame}
                    expanded={props.expandedGame === game.id}
                    editGame={props.editGame}
                    genreFilter={props.genreFilter}
                    groupBy={props.groupBy}
                    key={game.id}
                    skipGame={props.skipGame}
                    toggleGenreFilter={props.toggleGenreFilter}
                    game={game}
                />
            ))}
        </div>
    );
};

Group.defaultProps = {
    expandedGame: null,
};

Group.propTypes = {
    deleteGame: PropTypes.func.isRequired,
    expandGame: PropTypes.func.isRequired,
    expandedGame: PropTypes.string,
    editGame: PropTypes.func.isRequired,
    games: PropTypes.array.isRequired,
    genreFilter: PropTypes.array.isRequired,
    groupBy: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    skipGame: PropTypes.func.isRequired,
    toggleGenreFilter: PropTypes.func.isRequired,
};

export default Group;
