import System from '../models/System';

export default {
    Query: {
        systems: (parent, variables, context, info) => (
            System.query().graphqlEager(info)
        ),
    },
};
