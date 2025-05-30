import React from 'react';
import useListQuery from 'hooks/graphql/queries/list';
import useLocalStorage from 'hooks/useLocalStorage';
import Select from 'atoms/Select';
import LoadingContainer from 'molecules/LoadingContainer';
import OptionBar from 'molecules/OptionBar';
import Header from './List/Header';
import Games from './List/Games';
import Systems from './List/Systems';
import Developers from './List/Developers';
import Genres from './List/Genres';
import Franchises from './List/Franchises';
import Compilations from './List/Compilations';

const List = () => {
    const { loading, data } = useListQuery();
    const [activeList, setActiveList] = useLocalStorage('activeList', 'games');

    return (
        <LoadingContainer>
            {!loading && (
                <div className="list">
                    <Header />

                    <OptionBar>
                        <OptionBar.Group>
                            <OptionBar.Item label="List">
                                <Select
                                    options={[
                                        { value: 'games', label: 'Games' },
                                        { value: 'systems', label: 'Systems' },
                                        { value: 'developers', label: 'Developers' },
                                        { value: 'genres', label: 'Genres' },
                                        { value: 'franchises', label: 'Franchises' },
                                        { value: 'compilations', label: 'Compilations' },
                                    ]}
                                    onChange={setActiveList}
                                    value={activeList}
                                />
                            </OptionBar.Item>
                        </OptionBar.Group>
                    </OptionBar>

                    {activeList === 'games' && (
                        <Games
                            listId={data.list.id}
                            games={data.list.games}
                            systems={data.systems}
                            developers={data.developers}
                            compilations={data.compilations}
                            genres={data.genres}
                            franchises={data.franchises}
                        />
                    )}

                    {activeList === 'systems' && (
                        <Systems
                            games={data.list.games}
                            systems={data.systems}
                        />
                    )}

                    {activeList === 'developers' && (
                        <Developers
                            games={data.list.games}
                            developers={data.developers}
                        />
                    )}

                    {activeList === 'genres' && (
                        <Genres
                            games={data.list.games}
                            genres={data.genres}
                        />
                    )}

                    {activeList === 'franchises' && (
                        <Franchises
                            games={data.list.games}
                            franchises={data.franchises}
                        />
                    )}

                    {activeList === 'compilations' && (
                        <Compilations
                            games={data.list.games}
                            compilations={data.compilations}
                        />
                    )}
                </div>
            )}
        </LoadingContainer>
    );
};

export default List;
