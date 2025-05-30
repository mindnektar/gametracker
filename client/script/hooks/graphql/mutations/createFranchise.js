import { useMutation } from 'apollo-augmented-hooks';
import FRANCHISE from '../fragments/franchise';

const mutation = `
    mutation createFranchise($input: CreateFranchiseInput!) {
        createFranchise(input: $input) {
            ${FRANCHISE}
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
                    franchises: ({ includeIf }) => includeIf(true),
                },
            }],
        })
    );
};
