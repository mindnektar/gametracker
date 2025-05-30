import { useMutation } from 'apollo-augmented-hooks';
import SYSTEM from '../fragments/system';

const mutation = `
    mutation updateSystemOrder($input: UpdateSystemOrderInput!) {
        updateSystemOrder(input: $input) {
            ${SYSTEM}
        }
    }
`;

export default () => {
    const [mutate] = useMutation(mutation);

    return (input, systems) => (
        mutate({
            input,
            optimisticResponse: systems,
            modifiers: [{
                fields: {
                    systems: ({ includeIf }) => includeIf(true),
                },
            }],
        })
    );
};
