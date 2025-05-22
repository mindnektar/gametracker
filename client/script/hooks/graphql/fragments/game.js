import { gql } from '@apollo/client';
import dlcFragment from './dlc';

export default gql`
    ${dlcFragment}
    fragment GameFragment on Game {
        id
        title
        rating
        release
        description
        youTubeId
        status
        skipCount
        updatedAt
        timeToBeat
        criticRating
        system {
            id
            name
        }
        developer {
            id
            name
        }
        genres {
            id
            name
        }
        compilation {
            id
            title
        }
        dlcs {
            ...DlcFragment
        }
        franchise {
            id
            name
        }
    }
`;
