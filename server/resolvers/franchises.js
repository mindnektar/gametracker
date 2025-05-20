import Franchise from '../models/Franchise';

export default {
    Query: {
        franchises: (parent, variables, context, info) => (
            Franchise.query().graphqlEager(info)
        ),
    },
};
