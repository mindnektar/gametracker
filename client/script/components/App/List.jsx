import React, { useState } from 'react';
import useListQuery from 'hooks/graphql/queries/list';
import useSkipGame from 'hooks/graphql/mutations/skipGame';
import useDeleteGame from 'hooks/graphql/mutations/deleteGame';
import groupMap from 'helpers/groupMap';
import statusMap from 'helpers/statusMap';
import LoadingContainer from 'molecules/LoadingContainer';
import Header from './List/Header';
import Meta from './List/Meta';
import Group from './List/Group';
import Editor from './List/Editor';

const List = () => {
    const { loading, data } = useListQuery();
    const skipGame = useSkipGame();
    const deleteGame = useDeleteGame();
    const [groupBy, setGroupBy] = useState({ value: 'system', label: 'System' });
    const [statusFilter, setStatusFilter] = useState({ value: 'completed', label: statusMap.completed });
    const [expandedGame, setExpandedGame] = useState(null);
    const [genreFilter, setGenreFilter] = useState([]);
    const [editorState, setEditorState] = useState({ id: null, isOpen: false });

    const getGroups = () => {
        if (!data) {
            return [];
        }

        if (groupBy.value === 'none') {
            return [{ name: 'All games', games: data.list.games }];
        }

        const groups = data.list.games.reduce((result, current) => {
            const name = groupMap[groupBy.value].resolver(current);

            if (current.status !== statusFilter.value && statusFilter.value !== 'all') {
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

        return Object.values(groups).sort(groupMap[groupBy.value].sort);
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

    const openEditor = (id) => {
        setEditorState({ id, isOpen: true });
    };

    const closeEditor = () => {
        setEditorState((previous) => ({ ...previous, isOpen: false }));
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
                        openEditor={openEditor}
                        pickRandom={pickRandom}
                        groupBy={groupBy}
                        setGroupBy={setGroupBy}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                    />

                    {groups.map((group) => (
                        <Group
                            key={group.name}
                            deleteGame={deleteGame}
                            expandGame={toggleExpandedGame}
                            expandedGame={expandedGame}
                            editGame={openEditor}
                            genreFilter={genreFilter}
                            groupBy={groupBy.value}
                            toggleGenreFilter={toggleGenreFilter}
                            name={group.name}
                            games={group.games}
                            skipGame={onSkipGame}
                        />
                    ))}

                    <Editor
                        open={editorState.isOpen}
                        game={data.list.games.find(({ id }) => id === editorState.id)}
                        onClose={closeEditor}
                        systems={data.systems}
                        developers={data.developers}
                        compilations={data.compilations}
                        genres={data.genres}
                        listId={data.list.id}
                    />
                </div>
            )}
        </LoadingContainer>
    );
};

export default List;
