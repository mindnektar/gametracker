import { useMutation } from 'apollo-augmented-hooks';
import GENRE from '../fragments/genre';

const mutation = `
    mutation updateGenre($input: UpdateGenreInput!) {
        updateGenre(input: $input) {
            ${GENRE}
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
