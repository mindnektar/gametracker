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
            },
        })
    );
};
