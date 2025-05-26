import { gql, useMutation } from '@apollo/client';

const MUTATION = gql`
    mutation deleteSystem($id: ID!) {
        deleteSystem(id: $id) {
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
                cache.evict({ id: `System:${id}` });
            },
        })
    );
};
