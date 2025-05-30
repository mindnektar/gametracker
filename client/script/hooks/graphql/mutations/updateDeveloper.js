import { useMutation } from 'apollo-augmented-hooks';
import DEVELOPER from '../fragments/developer';

const mutation = `
    mutation updateDeveloper($input: UpdateDeveloperInput!) {
        updateDeveloper(input: $input) {
            ${DEVELOPER}
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
