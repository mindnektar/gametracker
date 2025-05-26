import { gql, useMutation } from '@apollo/client';
import systemFragment from '../fragments/system';

const MUTATION = gql`
    ${systemFragment}
    mutation updateSystemOrder($input: UpdateSystemOrderInput!) {
        updateSystemOrder(input: $input) {
            ...SystemFragment
        }
    }
`;

export default () => {
    const [mutation] = useMutation(MUTATION);

    return (input, systems) => (
        mutation({
            variables: { input },
            optimisticResponse: {
                updateSystemOrder: systems,
            },
        })
    );
};
