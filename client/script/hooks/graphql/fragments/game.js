import DLC from './dlc';
import SYSTEM from './system';
import DEVELOPER from './developer';

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
        id
        name
    }
    compilation {
        id
        title
    }
    dlcs {
        ${DLC}
    }
    franchise {
        id
        name
    }
`;
