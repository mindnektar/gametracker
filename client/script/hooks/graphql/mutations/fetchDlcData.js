import { gql, useMutation } from '@apollo/client';

const MUTATION = gql`
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
    const [mutation] = useMutation(MUTATION);

    return (input) => (
        mutation({
            variables: {
                input,
            },
        })
    );
};
