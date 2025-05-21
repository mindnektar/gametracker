import { systemOrder } from './systems';

export default {
    system: {
        label: 'System',
        resolver: (game) => game.system.name,
        sort: (a, b) => systemOrder.indexOf(a.name) - systemOrder.indexOf(b.name),
    },
    developer: {
        label: 'Developer',
        resolver: (game) => game.developer.name,
        sort: (a, b) => a.name.localeCompare(b.name),
    },
    release: {
        label: 'Release year',
        resolver: (game) => game.release,
        sort: (a, b) => a.name - b.name,
    },
    rating: {
        label: 'Rating',
        resolver: (game) => game.rating,
        sort: (a, b) => b.name - a.name,
    },
    timeToBeat: {
        label: 'Time to beat',
        resolver: (game) => game.timeToBeat || 'N/A',
        sort: (a, b) => {
            if (a.name === 'N/A') {
                return 1;
            }

            if (b.name === 'N/A') {
                return -1;
            }

            return a.name - b.name;
        },
    },
    franchise: {
        label: 'Franchise',
        resolver: (game) => game.franchise?.name || 'Standalone',
        sort: (a, b) => a.name.localeCompare(b.name),
    },
};
