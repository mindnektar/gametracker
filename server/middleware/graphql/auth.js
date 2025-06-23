module.exports = (resolve, parent, variables, context, info) => {
    if (info.path.typename === 'Mutation' && context.authKey !== 'superduper12%') {
        throw new Error('Unauthorized');
    }

    return resolve(parent, variables, context, info);
};
