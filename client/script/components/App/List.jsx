import React, { useState } from 'react';
import useListQuery from 'hooks/graphql/queries/list';
import groupMap from 'helpers/groupMap';
import LoadingContainer from 'molecules/LoadingContainer';
import Header from './List/Header';
import Meta from './List/Meta';
import Group from './List/Group';
import Editor from './List/Editor';

const List = () => {
    const { loading, data } = useListQuery();
    const [groupBy, setGroupBy] = useState({ value: 'system', label: 'System' });
    const [expandedGame, setExpandedGame] = useState(null);
    const [genreFilter, setGenreFilter] = useState([]);
    const [editorState, setEditorState] = useState({ id: null, isOpen: false });

    const getGroups = () => {
        if (groupBy.value === 'none') {
            return [{ name: 'All games', games: data.list.games }];
        }

        const groups = data.list.games.reduce((result, current) => {
            const name = groupMap[groupBy.value].resolver(current);

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

    return (
        <LoadingContainer>
            {!loading && (
                <div className="list">
                    <Header
                        listName={data.list.name}
                        gameCount={data.list.games.length}
                    />

                    <Meta
                        openEditor={openEditor}
                        groupBy={groupBy}
                        setGroupBy={setGroupBy}
                    />

                    {getGroups().map((group) => (
                        <Group
                            key={group.name}
                            expandGame={setExpandedGame}
                            expandedGame={expandedGame}
                            editGame={openEditor}
                            genreFilter={genreFilter}
                            groupBy={groupBy.value}
                            toggleGenreFilter={toggleGenreFilter}
                            name={group.name}
                            games={group.games}
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
