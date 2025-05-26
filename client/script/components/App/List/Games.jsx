import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
        if (groupBy === 'none') {
            return [{ name: 'All games', games: props.games }];
        }

        const groups = props.games.reduce((result, current) => {
            const name = groupMap[groupBy].resolver(current);

            if (current.status !== statusFilter && statusFilter !== 'all') {
                return result;
            }

            return {
                ...result,
                [name]: {
                    ...(result.name || {}),
                    name: `${name}`,
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
        window.scrollTo({ top: document.querySelector(`[data-game="${game.id}"]`).offsetTop - 80, behavior: 'smooth' });
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
                                ...Object.entries(groupMap).map(([value, { label }]) => ({
                                    value, label,
                                })),
                                { value: 'none', label: 'None' },
                            ]}
                            onChange={setGroupBy}
                            value={groupBy}
                        />
                    </OptionBar.Item>

                    <OptionBar.Item label="Status">
                        <Select
                            options={[
                                ...Object.entries(statusMap).map(([value, label]) => ({
                                    value, label,
                                })),
                                { value: 'all', label: 'All' },
                            ]}
                            onChange={setStatusFilter}
                            value={statusFilter}
                        />
                    </OptionBar.Item>

                    <OptionBar.Item label="Genres">
                        <Select
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

                    <OptionBar.Item>
                        <Button onClick={openGameEditor}>
                            Add game
                        </Button>
                    </OptionBar.Item>
                </OptionBar.Group>
            </OptionBar>

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
