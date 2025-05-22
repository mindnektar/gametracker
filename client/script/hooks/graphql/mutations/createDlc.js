import { gql, useMutation } from '@apollo/client';
import dlcFragment from '../fragments/dlc';

const MUTATION = gql`
    ${dlcFragment}
    mutation createDlc($input: CreateDlcInput!) {
        createDlc(input: $input) {
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
            update: (cache, { data: { createDlc } }) => {
                cache.modify({
                    id: `Game:${input.gameId}`,
                    fields: {
                        dlcs: (existingDlcs) => {
                            const dlcRef = cache.writeFragment({
                                data: createDlc,
                                fragment: dlcFragment,
                            });

                            return [...existingDlcs, dlcRef];
                        },
                    },
                });
            },
        })
    );
};
