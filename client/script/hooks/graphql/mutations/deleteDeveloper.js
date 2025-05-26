import { gql, useMutation } from '@apollo/client';

const MUTATION = gql`
    mutation deleteDeveloper($id: ID!) {
        deleteDeveloper(id: $id) {
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
                cache.evict({ id: `Developer:${id}` });
            },
        })
    );
};
