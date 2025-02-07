import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Button from 'atoms/Button';
import Rating from './Game/Rating';

const Game = (props) => {
    const expandGame = () => {
        props.expandGame(props.game.id);
    };

    const editGame = () => {
        props.editGame(props.game.id);
    };

    const toggleGenreFilterHandler = (genreId) => (event) => {
        event.stopPropagation();
        props.toggleGenreFilter(genreId);
    };

    return (
        <div
            className={classnames(
                'game',
                {
                    'game--expanded': props.expanded,
                    'game--planned': props.game.status === 'planned',
                    'game--active': props.game.status === 'active',
                    'game--dropped': props.game.status === 'dropped',
                }
            )}
            data-game={props.game.id}
        >
            <div
                className="game__head"
                onClick={expandGame}
            >
                <div className="game__title">
                    {props.game.title}

                    {props.game.compilation && (
                        <span className="game__title-compilation">
                            ({props.game.compilation.title})
                        </span>
                    )}

                    {props.game.dlcs.length > 0 && (
                        <span className="game__title-dlc-count">
                            {props.game.dlcs.length} DLC{props.game.dlcs.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {props.groupBy !== 'status' && (
                    <div
                        className={classnames(
                            'game__status',
                            {
                                'game__status--active': props.game.status === 'active',
                                'game__status--dropped': props.game.status === 'dropped',
                                'game__status--planned': props.game.status === 'planned',
                                'game__status--completed': props.game.status === 'completed',
                            }
                        )}
                    >
                        {props.game.status}
                    </div>
                )}

                <div className="game__genre">
                    {props.game.genres.map((genre) => (
                        <span
                            className={classnames(
                                'game__genre-item',
                                { 'game__genre-item--active': props.genreFilter.includes(genre.id) }
                            )}
                            key={genre.id}
                            onClick={toggleGenreFilterHandler(genre.id)}
                        >
                            {genre.name}
                        </span>
                    ))}
                </div>

                {props.groupBy !== 'system' && (
                    <div className="game__system">
                        {props.game.system.name}
                    </div>
                )}

                {props.groupBy !== 'developer' && (
                    <div className="game__developer">
                        {props.game.developer.name}
                    </div>
                )}

                {props.groupBy !== 'release' && (
                    <div className="game__release">
                        {props.game.release}
                    </div>
                )}

                {props.groupBy !== 'rating' && (
                    <Rating
                        value={props.game.rating}
                        visible={props.game.status === 'completed'}
                    />
                )}
            </div>

            <TransitionGroup>
                {props.expanded && (
                    <CSSTransition
                        classNames="game__body-"
                        key={props.game.id}
                        mountOnEnter
                        timeout={{
                            enter: 300,
                            exit: 300,
                        }}
                        unmountOnExit
                    >
                        <div className="game__body">
                            <div className="game__info">
                                {props.game.youTubeId ? (
                                    <iframe
                                        title={props.game.youTubeId}
                                        allowFullScreen
                                        className="game__video"
                                        src={`https://www.youtube.com/embed/${props.game.youTubeId}`}
                                    />
                                ) : (
                                    <div className="game__video-placeholder" />
                                )}

                                <div className="game__description">
                                    {props.game.description}

                                    {props.game.dlcs.length > 0 && (
                                        <div className="game__dlcs">
                                            <div className="game__dlcs-header">DLCs</div>

                                            <div>
                                                {props.game.dlcs.map((dlc) => (
                                                    <div
                                                        className="game__dlc"
                                                        key={dlc.id}
                                                    >
                                                        <div>{dlc.title}</div>

                                                        <Rating value={dlc.rating} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="game__edit">
                                        <Button onClick={editGame}>
                                            Edit game
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CSSTransition>
                )}
            </TransitionGroup>
        </div>
    );
};

Game.propTypes = {
    game: PropTypes.object.isRequired,
    expanded: PropTypes.bool.isRequired,
    expandGame: PropTypes.func.isRequired,
    editGame: PropTypes.func.isRequired,
    genreFilter: PropTypes.array.isRequired,
    groupBy: PropTypes.string.isRequired,
    toggleGenreFilter: PropTypes.func.isRequired,
};

export default Game;
