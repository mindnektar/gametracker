import moment from 'moment';
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
    completed: {
        label: 'Date of completion',
        resolver: (game) => (
            game.status === 'completed' ? moment(game.updatedAt).format('MMMM YYYY') : null
        ),
        sort: (a, b) => moment(a.updatedAt).diff(b.updatedAt),
    },
};
