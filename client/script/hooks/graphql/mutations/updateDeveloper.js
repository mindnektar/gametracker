import { gql, useMutation } from '@apollo/client';
import developerFragment from '../fragments/developer';

const MUTATION = gql`
    ${developerFragment}
    mutation updateDeveloper($input: UpdateDeveloperInput!) {
        updateDeveloper(input: $input) {
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
        })
    );
};
