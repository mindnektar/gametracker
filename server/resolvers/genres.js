import Genre from '../models/Genre';

export default {
    Query: {
        genres: (parent, variables, context, info) => (
            Genre.query().graphqlEager(info)
        ),
    },
};
