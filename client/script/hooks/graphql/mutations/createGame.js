import { gql, useMutation } from '@apollo/client';
import gameFragment from '../fragments/game';
import { addDataToCache } from '../cacheUpdates/game';

const MUTATION = gql`
    ${gameFragment}
    mutation createGame($input: CreateGameInput!) {
        createGame(input: $input) {
            ...GameFragment
        }
    }
`;

export default () => {
    const [mutation] = useMutation(MUTATION);

    return (input) => (
        mutation({
            variables: {
                input,
            },
            update: (cache, { data: { createGame } }) => {
                cache.modify({
                    id: `List:${input.lists[0].id}`,
                    fields: {
                        games: (existingGames) => {
                            const gameRef = cache.writeFragment({
                                data: createGame,
                                fragment: gameFragment,
                            });

                            return [...existingGames, gameRef];
                        },
                    },
                });
                addDataToCache(cache, createGame.franchise, 'franchises', 'Franchise');
                addDataToCache(cache, createGame.developer, 'developers', 'Developer');
                addDataToCache(cache, createGame.compilation, 'compilations', 'Compilation');
                addDataToCache(cache, createGame.system, 'systems', 'System');

                cache.modify({
                    fields: {
                        genres: (existingGenres, { readField }) => {
                            const newGenres = createGame.genres.filter((genre) => (
                                !existingGenres.some((existingGenre) => readField('id', existingGenre) === genre.id)
                            ));

                            if (newGenres.length === 0) {
                                return existingGenres;
                            }

                            const genreRefs = newGenres.map((genre) => cache.writeFragment({
                                data: genre,
                                fragment: gql`
                                    fragment GenreFragment on Genre {
                                        id
                                        name
                                    }
                                `,
                            }));

                            return [...existingGenres, ...genreRefs];
                        },
                    },
                });
            },
        })
    );
};
