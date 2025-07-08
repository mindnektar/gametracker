import React from 'react';
import PropTypes from 'prop-types';
import { formatTimeToBeat } from 'helpers/timeToBeat';
import { isLoggedIn } from 'helpers/auth';
import Rating from 'atoms/Rating';
import Game from './Group/Game';

const Group = (props) => {
    const games = props.group.games.toSorted((a, b) => a.title.localeCompare(b.title));

    if (games.length === 0) {
        return null;
    }

    return (
        <div className="group">
            <div className="group__header">
                <div className="group__title">
                    {props.group.subLabel && (
                        <div className="group__sub-label">
                            {props.group.subLabel}
                        </div>
                    )}

                    <div className="group__label">
                        {props.group.displayValue}
                    </div>

                    <div className="group__count">{`${games.length} game${games.length !== 1 ? 's' : ''}`}</div>
                </div>

                <div className="group__meta">
                    {props.groupBy !== 'timeToBeat' && (
                        <div className="group__meta-time">
                            <div>
                                <span>&Sigma;</span> {formatTimeToBeat(props.group.totalTimeToBeat) || 'N/A'}
                            </div>

                            <div>
                                <span>&#8960;</span> {formatTimeToBeat(props.group.averageTimeToBeat) || 'N/A'}
                            </div>
                        </div>
                    )}

                    {props.groupBy !== 'criticRating' && (
                        <div className="group__meta-rating">
                            <Rating value={props.group.averageCriticRating === '0' ? null : props.group.averageCriticRating} />
                        </div>
                    )}

                    {props.groupBy !== 'rating' && ['all', 'completed'].includes(props.statusFilter) && (
                        <div className="group__meta-rating">
                            <Rating personal value={props.group.averageRating === '0' ? null : props.group.averageRating} />
                        </div>
                    )}

                    {isLoggedIn() && (
                        <div className="group__meta-padder" />
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
                    openDescriptorEditor={props.openDescriptorEditor}
                    genreFilter={props.genreFilter}
                    groupBy={props.groupBy}
                    key={game.id}
                    skipGame={props.skipGame}
                    statusFilter={props.statusFilter}
                    toggleGenreFilter={props.toggleGenreFilter}
                    toggleDescriptorFilter={props.toggleDescriptorFilter}
                    descriptorFilter={props.descriptorFilter}
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
    openDescriptorEditor: PropTypes.func.isRequired,
    genreFilter: PropTypes.array.isRequired,
    groupBy: PropTypes.string.isRequired,
    skipGame: PropTypes.func.isRequired,
    statusFilter: PropTypes.string.isRequired,
    toggleGenreFilter: PropTypes.func.isRequired,
    toggleDescriptorFilter: PropTypes.func.isRequired,
    descriptorFilter: PropTypes.object.isRequired,
    group: PropTypes.object.isRequired,
};

export default Group;
