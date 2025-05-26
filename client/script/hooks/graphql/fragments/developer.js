import { gql } from '@apollo/client';

export default gql`
    fragment DeveloperFragment on Developer {
        id
        name
    }
`;
