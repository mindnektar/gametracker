import { useMutation } from 'apollo-augmented-hooks';
import DLC from '../fragments/dlc';

const mutation = `
    mutation updateDlc($input: UpdateDlcInput!) {
        updateDlc(input: $input) {
            ${DLC}
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
