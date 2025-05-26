import { gql } from '@apollo/client';

export default gql`
    fragment SystemFragment on System {
        id
        name
        order
    }
`;
