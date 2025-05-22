import { gql, useMutation } from '@apollo/client';
import dlcFragment from '../fragments/dlc';

const MUTATION = gql`
    ${dlcFragment}
    mutation updateDlc($input: UpdateDlcInput!) {
        updateDlc(input: $input) {
            ...DlcFragment
        }
    }
`;

export default () => {
    const [mutation] = useMutation(MUTATION);

    return (input) => (
        mutation({
            variables: {
                input,
            },
        })
    );
};
