import { useMutation } from 'apollo-augmented-hooks';
import DEVELOPER from '../fragments/developer';

const mutation = `
    mutation createDeveloper($input: CreateDeveloperInput!) {
        createDeveloper(input: $input) {
            ${DEVELOPER}
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
                    developers: ({ includeIf }) => (
                        includeIf(true)
                    ),
                },
            }],
        })
    );
};
