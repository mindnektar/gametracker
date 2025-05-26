import { gql, useMutation } from '@apollo/client';
import systemFragment from '../fragments/system';

const MUTATION = gql`
    ${systemFragment}
    mutation updateSystem($input: UpdateSystemInput!) {
        updateSystem(input: $input) {
            ...SystemFragment
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
