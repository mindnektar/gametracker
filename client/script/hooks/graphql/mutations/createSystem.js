import { useMutation } from 'apollo-augmented-hooks';
import SYSTEM from '../fragments/system';

const mutation = `
    mutation createSystem($input: CreateSystemInput!) {
        createSystem(input: $input) {
            ${SYSTEM}
        }
    }
`;

export default () => {
    const [mutate] = useMutation(mutation);

    return (input) => (
        mutate({
            input,
            modifiers: [{
                fields: {
                    systems: ({ includeIf }) => includeIf(true),
                },
            }],
        })
    );
};
