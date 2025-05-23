import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Markdown from 'react-markdown';
import IconButton from 'atoms/IconButton';
import Collapsible from 'molecules/Collapsible';
import PopupDialog from 'molecules/PopupDialog';
import Rating from './Game/Rating';

const Game = (props) => {
    const expandGame = () => {
        props.expandGame(props.game.id);
    };

    const editGame = () => {
        props.openGameEditor(props.game.id);
    };

    const skipGame = () => {
        props.skipGame(props.game.id);
    };

    const deleteGame = () => {
        props.deleteGame(props.game.id);
    };

    const addDlc = () => {
        props.openDlcEditor({ gameId: props.game.id });
    };

    const editDlcHandler = (dlcId) => () => {
        props.openDlcEditor({ gameId: props.game.id, dlcId });
    };

    const deleteDlcHandler = (dlcId) => () => {
        props.deleteDlc(dlcId);
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
                className={classnames(
                    'game__status',
                    {
                        'game__status--active': props.game.status === 'active',
                        'game__status--dropped': props.game.status === 'dropped',
                        'game__status--planned': props.game.status === 'planned',
                        'game__status--completed': props.game.status === 'completed',
                    }
                )}
            />

            <div className="game__content">
                <div
                    className="game__head"
                    onClick={expandGame}
                >
                    <div className="game__title">
                        <div className="game__title-text">
                            {props.game.title}
                        </div>

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

                        {props.game.skipCount > 0 && (
                            <span className="game__title-skip-count">
                                {props.game.skipCount} Skip{props.game.skipCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

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

                    {props.groupBy !== 'timeToBeat' && (
                        <div className="game__time-to-beat">
                            {props.game.timeToBeat ? `${props.game.timeToBeat} h`.replace('.5', '½').replace(/^0/, '') : ''}
                        </div>
                    )}

                    {props.groupBy !== 'criticRating' && (
                        <Rating value={props.game.criticRating} />
                    )}

                    {props.groupBy !== 'rating' && (props.game.status === 'completed' || props.statusFilter === 'all') && (
                        <Rating
                            personal
                            value={props.game.status === 'completed' ? props.game.rating : null}
                        />
                    )}

                    <div className="game__actions">
                        <PopupDialog
                            items={[{
                                icon: 'edit',
                                label: 'Edit game',
                                onClick: editGame,
                            }, {
                                icon: 'double_arrow',
                                label: 'Skip game',
                                onClick: skipGame,
                                available: props.game.status === 'planned',
                            }, {
                                icon: 'add',
                                label: 'Add DLC',
                                onClick: addDlc,
                                available: props.game.status === 'completed',
                            }, {
                                icon: 'delete',
                                label: 'Delete game',
                                onClick: deleteGame,
                            }]}
                        >
                            {({ toggle }) => (
                                <IconButton
                                    type="more_horiz"
                                    onClick={toggle}
                                />
                            )}
                        </PopupDialog>
                    </div>
                </div>

                <Collapsible collapsed={!props.expanded}>
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
                                <Markdown>{props.game.description}</Markdown>

                                {props.game.dlcs.length > 0 && (
                                    <div className="game__dlcs">
                                        <h2>DLCs</h2>

                                        <div>
                                            {props.game.dlcs.map((dlc) => (
                                                <div
                                                    className="game__dlc"
                                                    key={dlc.id}
                                                >
                                                    <div className="game__title">{dlc.title}</div>

                                                    <div className="game__release">
                                                        {dlc.release}
                                                    </div>

                                                    <div className="game__time-to-beat">
                                                        {dlc.timeToBeat ? `${dlc.timeToBeat} h`.replace('.5', '½').replace(/^0/, '') : ''}
                                                    </div>

                                                    <Rating
                                                        value={dlc.criticRating}
                                                        visible={!!dlc.criticRating}
                                                    />

                                                    <Rating
                                                        personal
                                                        value={dlc.rating}
                                                        visible
                                                    />

                                                    <div className="game__actions">
                                                        <PopupDialog
                                                            items={[{
                                                                icon: 'edit',
                                                                label: 'Edit DLC',
                                                                onClick: editDlcHandler(dlc.id),
                                                            }, {
                                                                icon: 'delete',
                                                                label: 'Delete DLC',
                                                                onClick: deleteDlcHandler(dlc.id),
                                                            }]}
                                                        >
                                                            {({ toggle }) => (
                                                                <IconButton
                                                                    type="more_horiz"
                                                                    onClick={toggle}
                                                                />
                                                            )}
                                                        </PopupDialog>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Collapsible>
            </div>
        </div>
    );
};

Game.propTypes = {
    deleteDlc: PropTypes.func.isRequired,
    deleteGame: PropTypes.func.isRequired,
    game: PropTypes.object.isRequired,
    expanded: PropTypes.bool.isRequired,
    expandGame: PropTypes.func.isRequired,
    openGameEditor: PropTypes.func.isRequired,
    openDlcEditor: PropTypes.func.isRequired,
    skipGame: PropTypes.func.isRequired,
    genreFilter: PropTypes.array.isRequired,
    groupBy: PropTypes.string.isRequired,
    statusFilter: PropTypes.string.isRequired,
    toggleGenreFilter: PropTypes.func.isRequired,
};

export default Game;
