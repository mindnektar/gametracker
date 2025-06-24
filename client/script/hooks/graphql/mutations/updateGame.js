import { useMutation } from 'apollo-augmented-hooks';
import GAME from '../fragments/game';

const mutation = `
    mutation updateGame($input: UpdateGameInput!) {
        updateGame(input: $input) {
            ${GAME}
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
                    franchises: ({ includeIf, item }) => (
                        includeIf(true, { subjects: item.franchises })
                    ),
                    developers: ({ includeIf, item }) => (
                        includeIf(true, { subjects: [item.developer] })
                    ),
                    compilations: ({ previous, includeIf, item }) => (
                        item.compilation ? includeIf(true, { subjects: [item.compilation] }) : previous
                    ),
                    systems: ({ includeIf, item }) => (
                        includeIf(true, { subjects: [item.system] })
                    ),
                    genres: ({ includeIf, item }) => (
                        includeIf(true, { subjects: item.genres })
                    ),
                },
            }],
        })
    );
};
