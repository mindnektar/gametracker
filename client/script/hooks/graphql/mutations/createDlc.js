import { useMutation } from 'apollo-augmented-hooks';
import DLC from '../fragments/dlc';

const mutation = `
    mutation createDlc($input: CreateDlcInput!) {
        createDlc(input: $input) {
            ${DLC}
            game {
                id
            }
        }
    }
`;

export default () => {
    const [mutate] = useMutation(mutation);

    return (input) => (
        mutate({
            input,
            modifiers: [{
                cacheObject: (item) => item.game,
                fields: {
                    dlcs: ({ includeIf }) => includeIf(true),
                },
            }],
        })
    );
};
