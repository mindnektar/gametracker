import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { isLoggedIn } from 'helpers/auth';
import useSkipGame from 'hooks/graphql/mutations/skipGame';
import useDeleteGame from 'hooks/graphql/mutations/deleteGame';
import useDeleteDlc from 'hooks/graphql/mutations/deleteDlc';
import useLocalStorage from 'hooks/useLocalStorage';
import statusMap from 'helpers/statusMap';
import groupMap from 'helpers/groupMap';
import Select from 'atoms/Select';
import Button from 'atoms/Button';
import OptionBar from 'molecules/OptionBar';
import Group from './Games/Group';
import GameEditor from './Games/GameEditor';
import DlcEditor from './Games/DlcEditor';

const Games = (props) => {
    const skipGame = useSkipGame();
    const deleteGame = useDeleteGame();
    const deleteDlc = useDeleteDlc();
    const [groupBy, setGroupBy] = useLocalStorage('groupBy', 'system');
    const [statusFilter, setStatusFilter] = useLocalStorage('statusFilter', 'completed');
    const [expandedGame, setExpandedGame] = useState(null);
    const [genreFilter, setGenreFilter] = useLocalStorage('genreFilter', []);
    const [gameEditorState, setGameEditorState] = useState({ id: null, isOpen: false });
    const [dlcEditorState, setDlcEditorState] = useState({ id: null, isOpen: false });

    const getGroups = () => {
        const groups = props.games.reduce((result, current) => {
            const name = groupMap[groupBy].resolver(current);

            if (current.status !== statusFilter && statusFilter !== 'all') {
                return result;
            }

            if (genreFilter.length > 0 && !genreFilter.every((genreId) => current.genres.some(({ id }) => id === genreId))) {
                return result;
            }

            return {
                ...result,
                [name]: {
                    ...(result.name || {}),
                    name: `${name}`,
                    order: groupBy === 'system' && !result[name]
                        ? props.systems.find(({ id }) => id === current.system.id).order
                        : result[name]?.order,
                    displayValue: groupMap[groupBy].decorator?.(current, name) || name,
                    games: [
                        ...(result[name]?.games || []),
                        current,
                    ],
                },
            };
        }, {});

        return Object.values(groups).sort(groupMap[groupBy].sort);
    };

    const toggleGenreFilter = (genreId) => {
        const value = [...genreFilter];
        const index = value.indexOf(genreId);

        if (index < 0) {
            value.push(genreId);
        } else {
            value.splice(index, 1);
        }

        setGenreFilter(value);
    };

    const onSkipGame = (id) => {
        skipGame(id);
        pickRandom();
    };

    const toggleExpandedGame = (id) => {
        setExpandedGame((previous) => (previous === id ? null : id));
    };

    const groups = getGroups();
    const games = groups.flatMap((group) => group.games);

    const pickRandom = () => {
        const game = games[Math.floor(Math.random() * games.length)];

        setExpandedGame(game.id);
        window.scrollTo({ top: document.querySelector(`[data-game="${game.id}"]`).offsetTop, behavior: 'smooth', block: 'center' });
    };

    const openGameEditor = (id) => {
        setGameEditorState({ id, isOpen: true });
    };

    const closeGameEditor = () => {
        setGameEditorState((previous) => ({ ...previous, isOpen: false }));
    };

    const openDlcEditor = ({ gameId, dlcId }) => {
        setDlcEditorState({ gameId, dlcId, isOpen: true });
    };

    const closeDlcEditor = () => {
        setDlcEditorState((previous) => ({ ...previous, isOpen: false }));
    };

    return (
        <>
            <OptionBar>
                <OptionBar.Group>
                    <OptionBar.Item label="Group by">
                        <Select
                            options={[
                                ...Object.entries(groupMap).map(([value, { label, icon }]) => ({
                                    value, label, icon,
                                })),
                            ]}
                            onChange={setGroupBy}
                            value={groupBy}
                        />
                    </OptionBar.Item>

                    <OptionBar.Item label="Status">
                        <Select
                            options={[
                                ...Object.entries(statusMap).map(([value, status]) => ({
                                    value,
                                    ...status,
                                })),
                                { value: 'all', label: 'All', icon: 'public' },
                            ]}
                            onChange={setStatusFilter}
                            value={statusFilter}
                        />
                    </OptionBar.Item>

                    <OptionBar.Item label="Genres">
                        <Select
                            fallback="All"
                            multiple
                            options={props.genres.map(({ id, name }) => ({
                                value: id,
                                label: name,
                            }))}
                            onChange={setGenreFilter}
                            value={genreFilter}
                        />
                    </OptionBar.Item>
                </OptionBar.Group>

                <OptionBar.Group>
                    <OptionBar.Item>
                        <Button onClick={pickRandom}>
                            Pick random game
                        </Button>
                    </OptionBar.Item>

                    {isLoggedIn() && (
                        <OptionBar.Item>
                            <Button onClick={openGameEditor}>
                                Add game
                            </Button>
                        </OptionBar.Item>
                    )}
                </OptionBar.Group>
            </OptionBar>

            <div className="games__count">
                <span>{games.length} game{games.length !== 1 ? 's' : ''}</span>

                &nbsp;match{games.length === 1 ? 'es' : ''} the selected filters.
            </div>

            {groups.map((group) => (
                <Group
                    key={group.name}
                    deleteDlc={deleteDlc}
                    deleteGame={deleteGame}
                    expandGame={toggleExpandedGame}
                    expandedGame={expandedGame}
                    openGameEditor={openGameEditor}
                    openDlcEditor={openDlcEditor}
                    genreFilter={genreFilter}
                    groupBy={groupBy}
                    toggleGenreFilter={toggleGenreFilter}
                    name={group.name}
                    displayValue={group.displayValue}
                    games={group.games}
                    skipGame={onSkipGame}
                    statusFilter={statusFilter}
                />
            ))}

            <GameEditor
                open={gameEditorState.isOpen}
                game={props.games.find(({ id }) => id === gameEditorState.id)}
                onClose={closeGameEditor}
                systems={props.systems}
                developers={props.developers}
                compilations={props.compilations}
                genres={props.genres}
                listId={props.listId}
                franchises={props.franchises}
            />

            <DlcEditor
                open={dlcEditorState.isOpen}
                dlc={
                    props.games
                        .find(({ id }) => id === dlcEditorState.gameId)
                        ?.dlcs
                        .find(({ id }) => id === dlcEditorState.dlcId)
                }
                gameId={dlcEditorState.gameId}
                onClose={closeDlcEditor}
            />
        </>
    );
};

Games.propTypes = {
    listId: PropTypes.string.isRequired,
    games: PropTypes.object.isRequired,
    systems: PropTypes.array.isRequired,
    developers: PropTypes.array.isRequired,
    compilations: PropTypes.array.isRequired,
    genres: PropTypes.array.isRequired,
    franchises: PropTypes.array.isRequired,
};

export default Games;
