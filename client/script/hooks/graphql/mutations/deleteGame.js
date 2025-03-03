import { gql, useMutation } from '@apollo/client';

const MUTATION = gql`
    mutation deleteGame($id: ID!) {
        deleteGame(id: $id) {
            id
        }
    }
`;

export default () => {
    const [mutation] = useMutation(MUTATION);

    return (id) => (
        mutation({
            variables: {
                id,
            },
            update: (cache) => {
                cache.evict({ id: `Game:${id}` });
            },
        })
    );
};
