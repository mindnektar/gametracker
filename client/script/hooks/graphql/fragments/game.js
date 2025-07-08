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
    completedAt
    atmosphere
    mood
    pacing
    complexity
    playerAgency
    narrativeStructure
    challengeFocus
    challengeIntensity
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
    franchises {
        ${FRANCHISE}
    }
`;
