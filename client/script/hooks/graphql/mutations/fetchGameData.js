import { useMutation } from 'apollo-augmented-hooks';

const mutation = `
    mutation fetchGameData($input: FetchGameDataInput!) {
        fetchGameData(input: $input) {
            developer
            country
            genres
            release
            description
            youTubeId
            franchise
            timeToBeat
            criticRating
        }
    }
`;

export default () => {
    const [mutate] = useMutation(mutation);

    return (input) => (
        mutate({
            input,
        })
    );
};
