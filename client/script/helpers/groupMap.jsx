import React from 'react';
import { systemOrder } from 'helpers/systems';
import countries from 'helpers/countries';
import Flag from 'atoms/Flag';
import Rating from 'atoms/Rating';

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
    country: {
        label: 'Country',
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
        resolver: (game) => game.release,
        sort: (a, b) => a.name - b.name,
    },
    rating: {
        label: 'Personal rating',
        resolver: (game) => (game.rating && game.status === 'completed' ? game.rating : null),
        sort: (a, b) => b.name - a.name,
        decorator: (game) => (
            <Rating value={game.rating && game.status === 'completed' ? game.rating : null} />
        ),
    },
    criticRating: {
        label: 'Critic rating',
        resolver: (game) => (game.criticRating ? game.criticRating : null),
        sort: (a, b) => b.name - a.name,
        decorator: (game) => (
            <Rating value={game.criticRating} />
        ),
    },
    timeToBeat: {
        label: 'Time to beat',
        resolver: (game) => (
            game.timeToBeat
                ? `${game.timeToBeat} hour${game.timeToBeat > 1 ? 's' : ''}`.replace('.5', '½').replace(/^0/, '')
                : 'N/A'
        ),
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
