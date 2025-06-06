import DLC from './dlc';
import SYSTEM from './system';
import DEVELOPER from './developer';
import GENRE from './genre';
import FRANCHISE from './franchise';
import COMPILATION from './compilation';

export default `
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
    country
    system {
        ${SYSTEM}
    }
    developer {
        ${DEVELOPER}
    }
    genres {
        ${GENRE}
    }
    compilation {
        ${COMPILATION}
    }
    dlcs {
        ${DLC}
    }
    franchise {
        ${FRANCHISE}
    }
`;
