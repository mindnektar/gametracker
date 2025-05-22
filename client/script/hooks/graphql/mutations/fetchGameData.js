import { gql, useMutation } from '@apollo/client';

const MUTATION = gql`
    mutation fetchGameData($input: FetchGameDataInput!) {
        fetchGameData(input: $input) {
            developer
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
    const [mutation] = useMutation(MUTATION);

    return (input) => (
        mutation({
            variables: {
                input,
            },
        })
    );
};
