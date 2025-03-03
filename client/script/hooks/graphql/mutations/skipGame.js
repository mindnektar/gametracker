import { gql, useMutation } from '@apollo/client';
import gameFragment from '../fragments/game';

const MUTATION = gql`
    ${gameFragment}
    mutation skipGame($id: ID!) {
        skipGame(id: $id) {
            ...GameFragment
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
        })
    );
};
