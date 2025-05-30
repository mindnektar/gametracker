import { useMutation } from 'apollo-augmented-hooks';

const mutation = `
    mutation fetchDlcData($input: FetchDlcDataInput!) {
        fetchDlcData(input: $input) {
            release
            description
            youTubeId
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
