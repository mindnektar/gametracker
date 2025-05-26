import { gql } from '@apollo/client';
import dlcFragment from './dlc';
import systemFragment from './system';
import developerFragment from './developer';

export default gql`
    ${dlcFragment}
    ${systemFragment}
    ${developerFragment}
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
            ...SystemFragment
        }
        developer {
            ...DeveloperFragment
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
