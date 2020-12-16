import Compilation from '../models/Compilation';

export default {
    Query: {
        compilations: (parent, variables, context, info) => (
            Compilation.query().graphqlEager(info)
        ),
    },
};
