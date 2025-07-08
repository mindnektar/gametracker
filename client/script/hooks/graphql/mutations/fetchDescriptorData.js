import { useMutation } from 'apollo-augmented-hooks';

const mutation = `
    mutation fetchDescriptorData($input: FetchDescriptorDataInput!) {
        fetchDescriptorData(input: $input) {
            atmosphere
            mood
            pacing
            complexity
            playerAgency
            narrativeStructure
            challengeFocus
            challengeIntensity
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
