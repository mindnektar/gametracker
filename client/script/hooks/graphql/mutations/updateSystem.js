import { useMutation } from 'apollo-augmented-hooks';
import SYSTEM from '../fragments/system';

const mutation = `
    mutation updateSystem($input: UpdateSystemInput!) {
        updateSystem(input: $input) {
            ${SYSTEM}
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
