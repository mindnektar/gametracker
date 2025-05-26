import { gql, useMutation } from '@apollo/client';
import developerFragment from '../fragments/developer';

const MUTATION = gql`
    ${developerFragment}
    mutation createDeveloper($input: CreateDeveloperInput!) {
        createDeveloper(input: $input) {
            ...DeveloperFragment
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
            update: (cache, { data: { createDeveloper } }) => {
                cache.modify({
                    fields: {
                        developers: (existingDevelopers) => {
                            const developerRef = cache.writeFragment({
                                data: createDeveloper,
                                fragment: developerFragment,
                            });

                            return [...existingDevelopers, developerRef];
                        },
                    },
                });
            },
        })
    );
};
