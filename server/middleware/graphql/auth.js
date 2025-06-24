import config from '../../config';

export default (resolve, parent, variables, context, info) => {
    if (info.path.typename === 'Mutation' && context.authKey !== config.adminKey) {
        throw new Error('Unauthorized');
    }

    return resolve(parent, variables, context, info);
};
