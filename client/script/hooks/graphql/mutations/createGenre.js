import { useMutation } from 'apollo-augmented-hooks';
import GENRE from '../fragments/genre';

const mutation = `
    mutation createGenre($input: CreateGenreInput!) {
        createGenre(input: $input) {
            ${GENRE}
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
                    genres: ({ includeIf }) => includeIf(true),
                },
            }],
        })
    );
};
