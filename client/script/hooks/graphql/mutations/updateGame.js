import { gql, useMutation } from '@apollo/client';
import gameFragment from '../fragments/game';

const MUTATION = gql`
    ${gameFragment}
    mutation updateGame($input: UpdateGameInput!) {
        updateGame(input: $input) {
            ...GameFragment
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
