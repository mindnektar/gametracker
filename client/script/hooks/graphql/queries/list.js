import { gql, useQuery } from '@apollo/client';
import gameFragment from '../fragments/game';

const query = gql`
    ${gameFragment}
    query list {
        list {
            id
            name
            games {
                ...GameFragment
            }
        }
        systems {
            id
            name
        }
        developers {
            id
            name
        }
        compilations {
            id
            title
        }
        genres {
            id
            name
        }
    }
`;

export default () => useQuery(query);
