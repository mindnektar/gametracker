import { gql, useMutation } from '@apollo/client';
import systemFragment from '../fragments/system';

const MUTATION = gql`
    ${systemFragment}
    mutation createSystem($input: CreateSystemInput!) {
        createSystem(input: $input) {
            ...SystemFragment
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
            update: (cache, { data: { createSystem } }) => {
                cache.modify({
                    fields: {
                        systems: (existingSystems) => {
                            const systemRef = cache.writeFragment({
                                data: createSystem,
                                fragment: systemFragment,
                            });

                            return [...existingSystems, systemRef];
                        },
                    },
                });
            },
        })
    );
};
