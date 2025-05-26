import { gql, useQuery } from '@apollo/client';
import gameFragment from '../fragments/game';
import systemFragment from '../fragments/system';
import developerFragment from '../fragments/developer';

const query = gql`
    ${gameFragment}
    ${systemFragment}
    ${developerFragment}
    query list {
        list {
            id
            name
            games {
                ...GameFragment
            }
        }
        systems {
            ...SystemFragment
        }
        developers {
            ...DeveloperFragment
        }
        compilations {
            id
            title
        }
        genres {
            id
            name
        }
        franchises {
            id
            name
        }
    }
`;

export default () => useQuery(query);
