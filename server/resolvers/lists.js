import List from '../models/List';

export default {
    Query: {
        list: (parent, variables, context, info) => (
            List.query().where('name', 'Completed games').first().graphqlEager(info)
        ),
        lists: (parent, variables, context, info) => (
            List.query().graphqlEager(info)
        ),
    },
};
