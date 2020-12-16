const modifyRelationExpression = (object, level) => (
    Object.entries(object).forEach(([key, value]) => {
        // eslint-disable-next-line no-param-reassign
        level[key] = level[key] || {};

        if (typeof value === 'object') {
            modifyRelationExpression(value, level[key]);
        }
    })
);

export default (info, modelClass, additionalExpression, auth) => {
    if (!info) {
        return { relationExpression: null, filters: null };
    }

    const filters = {};
    const findSubSelections = (fields, previousModelClass, parentRelation) => (
        fields.reduce((result, current) => {
            if (current.kind === 'FragmentSpread') {
                return {
                    ...result,
                    ...findSubSelections(
                        info.fragments[current.name.value].selectionSet.selections,
                        previousModelClass,
                        parentRelation,
                    ),
                };
            }

            if (current.kind === 'InlineFragment') {
                if (previousModelClass.name === current.typeCondition.name.value) {
                    const nextModelClass = require(`../${current.typeCondition.name.value}`).default;
                    return {
                        ...result,
                        ...findSubSelections(
                            current.selectionSet.selections,
                            nextModelClass,
                            parentRelation,
                        ),
                    };
                }

                return result;
            }

            if (current.selectionSet) {
                const relation = previousModelClass.relationMappings[current.name.value];

                if (!relation) {
                    // Relation does not exist in model
                    return result;
                }

                const nextModelClass = require(`../${relation.modelClass}`).default;
                const subSelections = findSubSelections(
                    current.selectionSet.selections,
                    nextModelClass,
                    current.name.value,
                );

                if (current.arguments.length > 0) {
                    current.arguments.forEach((argument) => {
                        if (argument.name.value === 'filter') {
                            const nameSpace = current.alias
                                ? current.alias.value
                                : current.name.value;

                            if (argument.value.fields) {
                                subSelections.$modify = argument.value.fields.map((field) => {
                                    if (
                                        !(nextModelClass.filters
                                        && nextModelClass.filters[field.name.value])
                                    ) {
                                        throw new Error(`Tried to access unimplemented filter: ${field.name.value}`);
                                    }

                                    const filterName = `${nameSpace}.${field.name.value}`;
                                    let { value } = field.value;

                                    if (typeof value === 'undefined') {
                                        value = info.variableValues[field.value.name.value];
                                    }

                                    filters[filterName] = (builder) => (
                                        nextModelClass.filters[field.name.value](
                                            builder,
                                            value,
                                            parentRelation,
                                            auth,
                                        )
                                    );

                                    return filterName;
                                });
                            } else {
                                const filterValues = info.variableValues[argument.value.name.value];
                                subSelections.$modify = Object.entries(filterValues)
                                    .map(([key, value]) => {
                                        if (
                                            !(nextModelClass.filters
                                            && nextModelClass.filters[key])
                                        ) {
                                            throw new Error(`Tried to access unimplemented filter: ${key}`);
                                        }

                                        const filterName = `${nameSpace}.${key}`;

                                        filters[filterName] = (builder) => (
                                            nextModelClass.filters[key](
                                                builder,
                                                value,
                                                parentRelation,
                                                auth,
                                            )
                                        );

                                        return filterName;
                                    });
                            }
                        }
                    });
                }

                if (current.alias) {
                    subSelections.$relation = current.name.value;

                    return { ...result, [current.alias.value]: subSelections };
                }

                return { ...result, [current.name.value]: subSelections };
            }

            return result;
        }, {})
    );

    const relationExpression = findSubSelections(
        info.fieldNodes[0].selectionSet.selections,
        modelClass,
        info.fieldNodes[0].name.value,
    );

    modifyRelationExpression(additionalExpression || {}, relationExpression);
    console.log(`graphql eager/$loadRelated: relationExpression '${JSON.stringify(relationExpression)}', filters: ${JSON.stringify(filters)}`);
    return { relationExpression, filters };
};
