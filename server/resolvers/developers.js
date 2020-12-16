import Developer from '../models/Developer';

export default {
    Query: {
        developers: (parent, variables, context, info) => (
            Developer.query().graphqlEager(info)
        ),
    },
};
