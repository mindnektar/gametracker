import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';
import Markdown from 'react-markdown';
import { formatTimeToBeat } from 'helpers/timeToBeat';
import { isLoggedIn } from 'helpers/auth';
import descriptors from 'helpers/descriptors';
import IconButton from 'atoms/IconButton';
import Flag from 'atoms/Flag';
import Genre from 'atoms/Genre';
import Rating from 'atoms/Rating';
import Tooltip from 'atoms/Tooltip';
import PopupDialog from 'molecules/PopupDialog';
import ListItem from 'molecules/ListItem';

const Game = (props) => {
    const expandGame = () => {
        props.expandGame(props.game.id);
    };

    const editGame = () => {
        props.openGameEditor(props.game.id);
    };

    const editDescriptors = () => {
        props.openDescriptorEditor(props.game.id);
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

    const toggleDescriptorFilterHandler = (type, value) => () => {
        props.toggleDescriptorFilter(type, value);
    };

    const renderHead = () => (
        <>
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

                {props.game.skipCount > 0 && props.game.status === 'planned' && (
                    <span className="game__title-skip-count">
                        {props.game.skipCount} Skip{props.game.skipCount !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="game__genre">
                {props.game.genres.toSorted((a, b) => a.name.localeCompare(b.name)).map((genre) => (
                    <Genre
                        key={genre.id}
                        active={props.genreFilter.includes(genre.id)}
                        name={genre.name}
                        onClick={toggleGenreFilterHandler(genre.id)}
                    />
                ))}
            </div>

            {props.groupBy !== 'system' && (
                <div className="game__system">
                    {props.game.system.name}
                </div>
            )}

            {props.groupBy !== 'country' && (
                <div className="game__country">
                    <Flag code={props.game.country} />
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
                    {formatTimeToBeat(props.game.timeToBeat)}
                </div>
            )}

            {props.groupBy !== 'criticRating' && (
                <Rating value={props.game.criticRating} />
            )}

            {props.groupBy !== 'rating' && ['all', 'completed'].includes(props.statusFilter) && (
                <Rating
                    personal
                    value={props.game.status === 'completed' ? props.game.rating : null}
                />
            )}
        </>
    );

    const renderActions = () => (
        <PopupDialog
            items={[{
                icon: 'edit',
                label: 'Edit game',
                onClick: editGame,
            }, {
                icon: 'label',
                label: 'Edit descriptors',
                onClick: editDescriptors,
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
    );

    return (
        <ListItem
            actions={isLoggedIn() ? renderActions() : null}
            head={renderHead()}
            status={props.game.status}
            statusTooltip={props.game.completedAt ? (
                `Completed in ${moment(props.game.completedAt).locale('en').format('MMMM YYYY')}`
            ) : (
                null
            )}
            toggleExpanded={expandGame}
            expanded={props.expanded}
            dataProps={{
                'data-game': props.game.id,
            }}
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
                        {props.game.atmosphere !== null && (
                            <>
                                <h2>Descriptors</h2>

                                <div className="game__descriptors">
                                    {Object.entries(descriptors).map(([key, descriptor]) => (
                                        <div
                                            key={key}
                                            className={classnames(
                                                'game__descriptor',
                                                {
                                                    'game__descriptor--subdued': (
                                                        Object.keys(props.descriptorFilter).length > 0
                                                        && props.descriptorFilter[key] === undefined
                                                    ),
                                                },
                                            )}
                                            onClick={toggleDescriptorFilterHandler(key, props.game[key])}
                                        >
                                            <Tooltip content={descriptor.values[props.game[key]].description}>
                                                <div className="game__descriptor-type">
                                                    {descriptor.label}
                                                </div>

                                                <div className="game__descriptor-value">
                                                    {descriptor.values[props.game[key]].label}
                                                </div>
                                            </Tooltip>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

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
        </ListItem>
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
    openDescriptorEditor: PropTypes.func.isRequired,
    skipGame: PropTypes.func.isRequired,
    genreFilter: PropTypes.array.isRequired,
    descriptorFilter: PropTypes.object.isRequired,
    groupBy: PropTypes.string.isRequired,
    statusFilter: PropTypes.string.isRequired,
    toggleGenreFilter: PropTypes.func.isRequired,
    toggleDescriptorFilter: PropTypes.func.isRequired,
};

export default Game;
