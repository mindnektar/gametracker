import React, { useState } from 'react';
import PropTypes from 'prop-types';
import bigDecimal from 'js-big-decimal';
import { isLoggedIn } from 'helpers/auth';
import statusMap from 'helpers/statusMap';
import groupMap from 'helpers/groupMap';
import sortMap from 'helpers/sortMap';
import useToggle from 'hooks/useToggle';
import useSkipGame from 'hooks/graphql/mutations/skipGame';
import useDeleteGame from 'hooks/graphql/mutations/deleteGame';
import useDeleteDlc from 'hooks/graphql/mutations/deleteDlc';
import useLocalStorage from 'hooks/useLocalStorage';
import Select from 'atoms/Select';
import Button from 'atoms/Button';
import Graph from 'atoms/Graph';
import OptionBar from 'molecules/OptionBar';
import Collapsible from 'molecules/Collapsible';
import Group from './Games/Group';
import GameEditor from './Games/GameEditor';
import DlcEditor from './Games/DlcEditor';
import DescriptorEditor from './Games/DescriptorEditor';

const Games = (props) => {
    const skipGame = useSkipGame();
    const deleteGame = useDeleteGame();
    const deleteDlc = useDeleteDlc();
    const [groupBy, setGroupBy] = useLocalStorage('groupBy', 'system');
    const [sortBy, setSortBy] = useLocalStorage('sortBy', 'name');
    const [sortDirection, setSortDirection] = useLocalStorage('sortDirection', 'asc');
    const [statusFilter, setStatusFilter] = useLocalStorage('statusFilter', 'completed');
    const [expandedGame, setExpandedGame] = useState(null);
    const [genreFilter, setGenreFilter] = useLocalStorage('genreFilter', []);
    const [descriptorFilter, setDescriptorFilter] = useLocalStorage('descriptorFilter', {});
    const [gameEditorState, setGameEditorState] = useState({ id: null, isOpen: false });
    const [dlcEditorState, setDlcEditorState] = useState({ id: null, isOpen: false });
    const [descriptorEditorState, setDescriptorEditorState] = useState({ id: null, isOpen: false });
    const [isGraphVisible, showGraph, hideGraph] = useToggle(false);

    const getGroups = () => {
        const groups = props.games.reduce((result, current) => {
            const name = groupMap[groupBy]?.resolver(current);

            if (name === undefined) {
                return result;
            }

            const names = Array.isArray(name) ? name : [name];

            if (current.status !== statusFilter && statusFilter !== 'all') {
                return result;
            }

            if (genreFilter.length > 0 && !genreFilter.every((genreId) => current.genres.some(({ id }) => id === genreId))) {
                return result;
            }

            if (Object.entries(descriptorFilter).some(([key, value]) => current[key] !== value)) {
                return result;
            }

            return names.reduce((innerResult, value) => ({
                ...innerResult,
                [value]: {
                    ...(innerResult[value] || {}),
                    name: value,
                    order: groupBy === 'system' && !innerResult[value]
                        ? props.systems.find(({ id }) => id === current.system.id).order
                        : innerResult[value]?.order,
                    displayValue: groupMap[groupBy].decorator?.(current, value) || value,
                    subLabel: groupMap[groupBy].subLabel?.(current),
                    games: [
                        ...(innerResult[value]?.games || []),
                        current,
                    ],
                },
            }), result);
        }, {});

        const sortedGroups = Object.values(groups)
            .map((group) => {
                const gamesWithTimeToBeat = group.games.filter((game) => game.timeToBeat);
                const totalTimeToBeat = gamesWithTimeToBeat.reduce((total, game) => (
                    bigDecimal.add(total, `${game.timeToBeat}`)
                ), '0');
                const averageTimeToBeat = bigDecimal.divide(
                    totalTimeToBeat,
                    gamesWithTimeToBeat.length ? `${gamesWithTimeToBeat.length}` : '1',
                    1,
                );
                const gamesWithRating = group.games.filter((game) => game.status === 'completed');
                const averageRating = bigDecimal.divide(
                    gamesWithRating.reduce((total, game) => (
                        bigDecimal.add(total, `${game.rating}`)
                    ), '0'),
                    gamesWithRating.length ? `${gamesWithRating.length}` : '1',
                    1,
                );
                const gamesWithCriticRating = group.games.filter((game) => game.criticRating);
                const averageCriticRating = bigDecimal.divide(
                    gamesWithCriticRating.reduce((total, game) => (
                        bigDecimal.add(total, `${game.criticRating}`)
                    ), '0'),
                    gamesWithCriticRating.length ? `${gamesWithCriticRating.length}` : '1',
                    1,
                );

                return {
                    ...group,
                    totalTimeToBeat,
                    averageTimeToBeat,
                    averageRating,
                    averageCriticRating,
                };
            })
            .sort((a, b) => {
                const result = sortMap[sortBy].sort(a, b);

                if (result === 0) {
                    return sortMap.name.sort(a, b);
                }

                return result;
            });

        if (sortDirection === 'desc') {
            sortedGroups.reverse();
        }

        return sortedGroups;
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

    const toggleDescriptorFilter = (type, value) => {
        const filter = { ...descriptorFilter };

        if (filter[type]) {
            delete filter[type];
        } else {
            filter[type] = value;
        }

        setDescriptorFilter(filter);
    };

    const onSkipGame = (id) => {
        skipGame(id);
        pickRandom();
    };

    const toggleExpandedGame = (id) => {
        setExpandedGame((previous) => (previous === id ? null : id));
    };

    const groups = getGroups();
    const games = groups
        .flatMap((group) => group.games)
        .filter((game, index, self) => self.findIndex((item) => item.id === game.id) === index);

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

    const openDescriptorEditor = (id) => {
        setDescriptorEditorState({ id, isOpen: true });
    };

    const closeDescriptorEditor = () => {
        setDescriptorEditorState((previous) => ({ ...previous, isOpen: false }));
    };

    return (
        <>
            <OptionBar>
                <OptionBar.Group>
                    <OptionBar.Item label="Group by">
                        <Select
                            options={
                                Object.entries(groupMap).map(([value, { label, icon }]) => ({
                                    value, label, icon,
                                }))
                            }
                            onChange={setGroupBy}
                            value={groupBy}
                            defaultValue="system"
                        />
                    </OptionBar.Item>

                    <OptionBar.Item label="Sort by">
                        <Select
                            options={
                                Object.entries(sortMap)
                                    .filter(([, { usedBy }]) => !usedBy || usedBy.includes(groupBy))
                                    .map(([value, { label, icon }]) => ({
                                        value, label, icon,
                                    }))
                            }
                            onChange={setSortBy}
                            value={sortBy}
                            defaultValue="name"
                        />
                    </OptionBar.Item>

                    <OptionBar.Item label="Sort direction">
                        <Select
                            options={[
                                { value: 'asc', label: 'Ascending', icon: 'arrow_circle_up' },
                                { value: 'desc', label: 'Descending', icon: 'arrow_circle_down' },
                            ]}
                            onChange={setSortDirection}
                            value={sortDirection}
                            defaultValue="asc"
                        />
                    </OptionBar.Item>
                </OptionBar.Group>

                <OptionBar.Group>
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
                            defaultValue="completed"
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
            </OptionBar>

            <OptionBar>
                <OptionBar.Group>
                    <div className="games__count">
                        <span>{games.length} game{games.length !== 1 ? 's' : ''}</span>

                        &nbsp;match{games.length === 1 ? 'es' : ''} the selected filters.
                    </div>
                </OptionBar.Group>

                <OptionBar.Group>
                    <OptionBar.Item>
                        <Button onClick={isGraphVisible ? hideGraph : showGraph}>
                            {isGraphVisible ? 'Hide graph' : 'Show graph'}
                        </Button>
                    </OptionBar.Item>

                    {games.length > 0 && (
                        <OptionBar.Item>
                            <Button onClick={pickRandom}>
                                Pick random game
                            </Button>
                        </OptionBar.Item>
                    )}

                    {isLoggedIn() && (
                        <OptionBar.Item>
                            <Button onClick={openGameEditor}>
                                Add game
                            </Button>
                        </OptionBar.Item>
                    )}
                </OptionBar.Group>
            </OptionBar>

            <Collapsible collapsed={!isGraphVisible}>
                <Graph
                    data={groups.map((group) => ({
                        key: `${group.name}`,
                        label: group.displayValue,
                        dropped: group.games.filter((game) => game.status === 'dropped').length,
                        active: group.games.filter((game) => game.status === 'active').length,
                        planned: group.games.filter((game) => game.status === 'planned').length,
                        completed: group.games.filter((game) => game.status === 'completed').length,
                    }))}
                />
            </Collapsible>

            <div className="games__groups">
                {groups.map((group) => (
                    <Group
                        key={group.name}
                        deleteDlc={deleteDlc}
                        deleteGame={deleteGame}
                        expandGame={toggleExpandedGame}
                        expandedGame={expandedGame}
                        openGameEditor={openGameEditor}
                        openDlcEditor={openDlcEditor}
                        openDescriptorEditor={openDescriptorEditor}
                        genreFilter={genreFilter}
                        descriptorFilter={descriptorFilter}
                        groupBy={groupBy}
                        toggleGenreFilter={toggleGenreFilter}
                        toggleDescriptorFilter={toggleDescriptorFilter}
                        skipGame={onSkipGame}
                        statusFilter={statusFilter}
                        group={group}
                    />
                ))}
            </div>

            <GameEditor
                open={gameEditorState.isOpen}
                game={props.games.find(({ id }) => id === gameEditorState.id)}
                onClose={closeGameEditor}
                systems={props.systems}
                developers={props.developers}
                compilations={props.compilations}
                genres={props.genres}
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

            <DescriptorEditor
                open={descriptorEditorState.isOpen}
                game={props.games.find(({ id }) => id === descriptorEditorState.id)}
                onClose={closeDescriptorEditor}
            />
        </>
    );
};

Games.propTypes = {
    games: PropTypes.object.isRequired,
    systems: PropTypes.array.isRequired,
    developers: PropTypes.array.isRequired,
    compilations: PropTypes.array.isRequired,
    genres: PropTypes.array.isRequired,
    franchises: PropTypes.array.isRequired,
};

export default Games;
