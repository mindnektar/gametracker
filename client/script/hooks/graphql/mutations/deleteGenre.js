import { useMutation } from 'apollo-augmented-hooks';

const mutation = `
    mutation deleteGenre($id: ID!) {
        deleteGenre(id: $id) {
            id
        }
    }
`;

export default () => {
    const [mutate] = useMutation(mutation);

    return (input) => (
        mutate({
            input,
            modifiers: [{
                cacheObject: (item) => item,
                evict: true,
            }],
        })
    );
};
