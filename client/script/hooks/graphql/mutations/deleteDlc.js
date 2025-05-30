import { useMutation } from 'apollo-augmented-hooks';

const mutation = `
    mutation deleteDlc($id: ID!) {
        deleteDlc(id: $id) {
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
