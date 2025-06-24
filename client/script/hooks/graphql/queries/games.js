import { useQuery } from 'apollo-augmented-hooks';
import GAME from '../fragments/game';
import SYSTEM from '../fragments/system';
import DEVELOPER from '../fragments/developer';
import GENRE from '../fragments/genre';
import FRANCHISE from '../fragments/franchise';
import COMPILATION from '../fragments/compilation';

const query = `
    query games {
        games {
            ${GAME}
        }
        systems {
            ${SYSTEM}
        }
        developers {
            ${DEVELOPER}
        }
        compilations {
            ${COMPILATION}
        }
        genres {
            ${GENRE}
        }
        franchises {
            ${FRANCHISE}
        }
    }
`;

export default () => (
    useQuery(query)
);
