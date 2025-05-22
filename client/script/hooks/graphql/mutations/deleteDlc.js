import { gql, useMutation } from '@apollo/client';

const MUTATION = gql`
    mutation deleteDlc($id: ID!) {
        deleteDlc(id: $id) {
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
                cache.evict({ id: `Dlc:${id}` });
            },
        })
    );
};
