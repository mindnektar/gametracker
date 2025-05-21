import { gql, useMutation } from '@apollo/client';
import gameFragment from '../fragments/game';
import { addDataToCache } from '../cacheUpdates/game';

const MUTATION = gql`
    ${gameFragment}
    mutation updateGame($input: UpdateGameInput!) {
        updateGame(input: $input) {
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
            update: (cache, { data: { updateGame } }) => {
                addDataToCache(cache, updateGame.franchise, 'franchises', 'Franchise');
                addDataToCache(cache, updateGame.developer, 'developers', 'Developer');
                addDataToCache(cache, updateGame.compilation, 'compilations', 'Compilation');
                addDataToCache(cache, updateGame.system, 'systems', 'System');

                cache.modify({
                    fields: {
                        genres: (existingGenres, { readField }) => {
                            const newGenres = updateGame.genres.filter((genre) => (
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
