import { gql } from '@apollo/client';

export default gql`
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
            id
            title
            rating
        }
        franchise {
            id
            name
        }
    }
`;
