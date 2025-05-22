import { gql } from '@apollo/client';

export default gql`
    fragment DlcFragment on Dlc {
        id
        title
        rating
        release
        criticRating
        timeToBeat
        description
        youTubeId
    }
`;
