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
    },
    system: {
        label: 'System',
        icon: 'sports_esports',
        resolver: (game) => game.system.name,
        subLabel: (game) => game.system.company,
    },
    developer: {
        label: 'Developer',
        icon: 'groups',
        resolver: (game) => game.developer.name,
    },
    country: {
        label: 'Country',
        icon: 'flag_2',
        resolver: (game) => countries.find((country) => country.code === game.country)?.name || 'None',
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
    },
    rating: {
        label: 'Personal rating',
        icon: 'star',
        resolver: (game) => (game.rating && game.status === 'completed' ? game.rating : null),
        decorator: (game) => (
            <Rating value={game.rating && game.status === 'completed' ? game.rating : null} />
        ),
    },
    criticRating: {
        label: 'Critic rating',
        icon: 'stars_2',
        resolver: (game) => (game.criticRating ? game.criticRating : null),
        decorator: (game) => (
            <Rating value={game.criticRating} />
        ),
    },
    timeToBeat: {
        label: 'Time to beat',
        icon: 'alarm_on',
        resolver: (game) => game.timeToBeat || null,
        decorator: (game) => (
            game.timeToBeat
                ? formatTimeToBeat(game.timeToBeat)
                : 'N/A'
        ),
    },
    franchise: {
        label: 'Franchise',
        icon: 'label',
        resolver: (game) => (game.franchises.length === 0 ? 'Standalone' : game.franchises.map(({ name }) => name)),
    },
};
