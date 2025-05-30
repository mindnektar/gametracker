import { useMutation } from 'apollo-augmented-hooks';
import COMPILATION from '../fragments/compilation';

const mutation = `
    mutation updateCompilation($input: UpdateCompilationInput!) {
        updateCompilation(input: $input) {
            ${COMPILATION}
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
