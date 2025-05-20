import { gql, useMutation } from '@apollo/client';
import gameFragment from '../fragments/game';

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

                cache.modify({
                    fields: {
                        franchises: (existingFranchises, { readField }) => {
                            if (existingFranchises.some((franchise) => readField('id', franchise) === createGame.franchise.id)) {
                                return existingFranchises;
                            }

                            const franchiseRef = cache.writeFragment({
                                data: createGame.franchise,
                                fragment: gql`
                                    fragment FranchiseFragment on Franchise {
                                        id
                                        name
                                    }
                                `,
                            });

                            return [...existingFranchises, franchiseRef];
                        },
                    },
                });
            },
        })
    );
};
