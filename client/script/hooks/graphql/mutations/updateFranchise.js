import { useMutation } from 'apollo-augmented-hooks';
import FRANCHISE from '../fragments/franchise';

const mutation = `
    mutation updateFranchise($input: UpdateFranchiseInput!) {
        updateFranchise(input: $input) {
            ${FRANCHISE}
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
