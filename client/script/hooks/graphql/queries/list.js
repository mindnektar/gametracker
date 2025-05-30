import { useQuery } from 'apollo-augmented-hooks';
import GAME from '../fragments/game';
import SYSTEM from '../fragments/system';
import DEVELOPER from '../fragments/developer';

const query = `
    query list {
        list {
            id
            name
            games {
                ${GAME}
            }
        }
        systems {
            ${SYSTEM}
        }
        developers {
            ${DEVELOPER}
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

export default () => (
    useQuery(query)
);
