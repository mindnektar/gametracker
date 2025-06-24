import React from 'react';
import countries from 'helpers/countries';
import { formatTimeToBeat } from 'helpers/timeToBeat';
import Flag from 'atoms/Flag';
import Rating from 'atoms/Rating';

export default {
    none: {
        label: 'None',
        icon: 'block',
        resolver: () => 'All games',
        sort: () => 0,
    },
    system: {
        label: 'System',
        icon: 'sports_esports',
        resolver: (game) => game.system.name,
        subLabel: (game) => game.system.company,
        sort: (a, b) => a.order - b.order,
    },
    developer: {
        label: 'Developer',
        icon: 'groups',
        resolver: (game) => game.developer.name,
        sort: (a, b) => a.name.localeCompare(b.name),
    },
    country: {
        label: 'Country',
        icon: 'flag_2',
        resolver: (game) => countries.find((country) => country.code === game.country)?.name || 'None',
        sort: (a, b) => a.name.localeCompare(b.name),
        decorator: (game, resolvedName) => (
            <>
                <Flag code={game.country} />
                {resolvedName}
            </>
        ),
    },
    release: {
        label: 'Release year',
        icon: 'calendar_today',
        resolver: (game) => game.release,
        sort: (a, b) => a.name - b.name,
    },
    rating: {
        label: 'Personal rating',
        icon: 'star',
        resolver: (game) => (game.rating && game.status === 'completed' ? game.rating : null),
        sort: (a, b) => b.name - a.name,
        decorator: (game) => (
            <Rating value={game.rating && game.status === 'completed' ? game.rating : null} />
        ),
    },
    criticRating: {
        label: 'Critic rating',
        icon: 'stars_2',
        resolver: (game) => (game.criticRating ? game.criticRating : null),
        sort: (a, b) => b.name - a.name,
        decorator: (game) => (
            <Rating value={game.criticRating} />
        ),
    },
    timeToBeat: {
        label: 'Time to beat',
        icon: 'alarm_on',
        resolver: (game) => (
            game.timeToBeat
                ? formatTimeToBeat(game.timeToBeat)
                : 'N/A'
        ),
        sort: (a, b) => {
            if (a.name === 'N/A') {
                return 1;
            }

            if (b.name === 'N/A') {
                return -1;
            }

            return parseFloat(a.name.replace('h ', '').replace('30m', '.5')) - parseFloat(b.name.replace('h ', '').replace('30m', '.5'));
        },
    },
    franchise: {
        label: 'Franchise',
        icon: 'label',
        resolver: (game) => game.franchise?.name || 'Standalone',
        sort: (a, b) => a.name.localeCompare(b.name),
    },
};
