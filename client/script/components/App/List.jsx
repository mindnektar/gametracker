import React, { useState } from 'react';
import useListQuery from 'hooks/graphql/queries/list';
import useSkipGame from 'hooks/graphql/mutations/skipGame';
import useDeleteGame from 'hooks/graphql/mutations/deleteGame';
import useDeleteDlc from 'hooks/graphql/mutations/deleteDlc';
import useLocalStorage from 'hooks/useLocalStorage';
import groupMap from 'helpers/groupMap';
import LoadingContainer from 'molecules/LoadingContainer';
import Header from './List/Header';
import Meta from './List/Meta';
import Group from './List/Group';
import GameEditor from './List/GameEditor';
import DlcEditor from './List/DlcEditor';

const List = () => {
    const { loading, data } = useListQuery();
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
        if (!data) {
            return [];
        }

        if (groupBy === 'none') {
            return [{ name: 'All games', games: data.list.games }];
        }

        const groups = data.list.games.reduce((result, current) => {
            const name = groupMap[groupBy].resolver(current);

            if (current.status !== statusFilter && statusFilter !== 'all') {
                return result;
            }

            return {
                ...result,
                [name]: {
                    ...(result.name || {}),
                    name: `${name}`,
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

    return (
        <LoadingContainer>
            {!loading && (
                <div className="list">
                    <Header
                        listName={data.list.name}
                        gameCount={games.length}
                    />

                    <Meta
                        openGameEditor={openGameEditor}
                        pickRandom={pickRandom}
                        groupBy={groupBy}
                        setGroupBy={setGroupBy}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                    />

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
                            games={group.games}
                            skipGame={onSkipGame}
                            statusFilter={statusFilter}
                        />
                    ))}

                    <GameEditor
                        open={gameEditorState.isOpen}
                        game={data.list.games.find(({ id }) => id === gameEditorState.id)}
                        onClose={closeGameEditor}
                        systems={data.systems}
                        developers={data.developers}
                        compilations={data.compilations}
                        genres={data.genres}
                        listId={data.list.id}
                        franchises={data.franchises}
                    />

                    <DlcEditor
                        open={dlcEditorState.isOpen}
                        dlc={
                            data.list.games
                                .find(({ id }) => id === dlcEditorState.gameId)
                                ?.dlcs
                                .find(({ id }) => id === dlcEditorState.dlcId)
                        }
                        gameId={dlcEditorState.gameId}
                        onClose={closeDlcEditor}
                    />
                </div>
            )}
        </LoadingContainer>
    );
};

export default List;
