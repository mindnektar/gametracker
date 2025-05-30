import { useMutation } from 'apollo-augmented-hooks';
import COMPILATION from '../fragments/compilation';

const mutation = `
    mutation createCompilation($input: CreateCompilationInput!) {
        createCompilation(input: $input) {
            ${COMPILATION}
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
                    compilations: ({ includeIf }) => includeIf(true),
                },
            }],
        })
    );
};
