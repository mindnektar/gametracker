import bigDecimal from 'js-big-decimal';

export default {
    priority: {
        label: 'Priority',
        icon: 'leaderboard',
        usedBy: ['system'],
        sort: (a, b) => a.order - b.order,
    },
    name: {
        label: 'Name',
        icon: 'abc',
        sort: (a, b) => {
            if (typeof a.name === 'string') {
                return a.name.localeCompare(b.name);
            }

            return a.name - b.name;
        },
    },
    gameCount: {
        label: 'Game count',
        icon: '123',
        sort: (a, b) => a.games.length - b.games.length,
    },
    totalTimeToBeat: {
        label: 'Total time to beat',
        icon: 'alarm_on',
        sort: (a, b) => bigDecimal.subtract(a.totalTimeToBeat, b.totalTimeToBeat),
    },
    averageTimeToBeat: {
        label: 'Average time to beat',
        icon: 'alarm_on',
        sort: (a, b) => bigDecimal.subtract(a.averageTimeToBeat, b.averageTimeToBeat),
    },
    criticRating: {
        label: 'Average critic rating',
        icon: 'stars_2',
        sort: (a, b) => bigDecimal.subtract(a.averageCriticRating, b.averageCriticRating),
    },
    personalRating: {
        label: 'Average personal rating',
        icon: 'star',
        sort: (a, b) => bigDecimal.subtract(a.averageRating, b.averageRating),
    },
};
