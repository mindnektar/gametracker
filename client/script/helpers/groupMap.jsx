import React from 'react';
import moment from 'moment';
import countries from 'helpers/countries';
import { formatTimeToBeat } from 'helpers/timeToBeat';
import descriptors from 'helpers/descriptors';
import Flag from 'atoms/Flag';
import Rating from 'atoms/Rating';
import Tooltip from 'atoms/Tooltip';

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
    genre: {
        label: 'Genre',
        icon: 'crossword',
        resolver: (game) => game.genres.map(({ name }) => name),
    },
    monthOfCompletion: {
        label: 'Month of completion',
        icon: 'calendar_today',
        resolver: (game) => (game.completedAt ? moment(game.completedAt).locale('en').format('MMMM YYYY') : 'N/A'),
    },
    yearOfCompletion: {
        label: 'Year of completion',
        icon: 'calendar_today',
        resolver: (game) => (game.completedAt ? moment(game.completedAt).locale('en').year() : 'N/A'),
    },
    ...Object.fromEntries(Object.entries(descriptors).map(([key, descriptor]) => [key, {
        label: descriptor.label,
        icon: descriptor.icon,
        resolver: (game) => game[key] ?? null,
        decorator: (game) => (game[key] !== null ? (
            <Tooltip content={descriptor.values[game[key]].description}>
                {descriptor.values[game[key]].label}
            </Tooltip>
        ) : 'N/A'),
    }])),
};
