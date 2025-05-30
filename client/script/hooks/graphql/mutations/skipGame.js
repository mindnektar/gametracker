import { useMutation } from 'apollo-augmented-hooks';
import GAME from '../fragments/game';

const mutation = `
    mutation skipGame($id: ID!) {
        skipGame(id: $id) {
            ${GAME}
        }
    }
`;

export default () => {
    const [mutate] = useMutation(mutation);

    return (id) => (
        mutate({
            input: {
                id,
            },
        })
    );
};
