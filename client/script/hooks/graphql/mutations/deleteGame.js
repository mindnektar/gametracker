import { useMutation } from 'apollo-augmented-hooks';

const mutation = `
    mutation deleteGame($id: ID!) {
        deleteGame(id: $id) {
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
