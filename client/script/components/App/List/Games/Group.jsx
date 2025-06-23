import React from 'react';
import PropTypes from 'prop-types';
import bigDecimal from 'js-big-decimal';
import { isLoggedIn } from 'helpers/auth';
import Rating from 'atoms/Rating';
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

    const gamesWithTimeToBeat = games.filter((game) => game.timeToBeat);
    const totalTimeToBeat = gamesWithTimeToBeat.reduce((total, game) => (
        game.timeToBeat ? total + game.timeToBeat : total
    ), 0);
    const averageTimeToBeat = bigDecimal.divide(totalTimeToBeat, gamesWithTimeToBeat.length || 1);
    const gamesWithRating = games.filter((game) => game.rating);
    const averageRating = bigDecimal.divide(gamesWithRating.reduce((total, game) => (
        game.status === 'completed' ? bigDecimal.add(total, game.rating) : total
    ), 0), gamesWithRating.length || 1);
    const gamesWithCriticRating = games.filter((game) => game.criticRating);
    const averageCriticRating = bigDecimal.divide(gamesWithCriticRating.reduce((total, game) => (
        game.criticRating ? bigDecimal.add(total, game.criticRating) : total
    ), 0), gamesWithCriticRating.length || 1);

    const formatTime = (value) => {
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);

        if (minutes === 0) {
            return `${hours}h`;
        }

        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="group">
            <div className="group__header">
                <div className="group__title">
                    <div className="group__label">
                        {props.displayValue}
                    </div>

                    <div className="group__count">{`${games.length} game${games.length !== 1 ? 's' : ''}`}</div>
                </div>

                <div className="group__meta">
                    <div className="group__meta-item group__meta-time">
                        <div>
                            <span>&Sigma;</span> {formatTime(totalTimeToBeat)}
                        </div>

                        <div>
                            <span>&#8960;</span> {formatTime(averageTimeToBeat)}
                        </div>
                    </div>

                    <div className="group__meta-item group__meta-rating">
                        <Rating value={averageCriticRating} />
                    </div>

                    <div className="group__meta-item group__meta-rating">
                        <Rating personal value={averageRating} />
                    </div>

                    {isLoggedIn() && (
                        <div className="group__meta-item group__meta-padder" />
                    )}
                </div>
            </div>

            {games.map((game) => (
                <Game
                    deleteDlc={props.deleteDlc}
                    deleteGame={props.deleteGame}
                    expandGame={props.expandGame}
                    expanded={props.expandedGame === game.id}
                    openGameEditor={props.openGameEditor}
                    openDlcEditor={props.openDlcEditor}
                    genreFilter={props.genreFilter}
                    groupBy={props.groupBy}
                    key={game.id}
                    skipGame={props.skipGame}
                    statusFilter={props.statusFilter}
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
    deleteDlc: PropTypes.func.isRequired,
    deleteGame: PropTypes.func.isRequired,
    expandGame: PropTypes.func.isRequired,
    expandedGame: PropTypes.string,
    openGameEditor: PropTypes.func.isRequired,
    openDlcEditor: PropTypes.func.isRequired,
    games: PropTypes.array.isRequired,
    genreFilter: PropTypes.array.isRequired,
    groupBy: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    displayValue: PropTypes.string.isRequired,
    skipGame: PropTypes.func.isRequired,
    statusFilter: PropTypes.string.isRequired,
    toggleGenreFilter: PropTypes.func.isRequired,
};

export default Group;
