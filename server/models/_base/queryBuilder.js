import { Model, QueryBuilder } from 'objection';

const isObjectWithoutId = (value) => (
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && !value.id
);

const convertNodesWithoutIdToRelationExpression = (graph) => (
    Object.entries(graph).reduce((result, [key, value]) => {
        if (isObjectWithoutId(value)) {
            const subs = convertNodesWithoutIdToRelationExpression(value);

            return [
                ...result,
                subs.length > 0 ? `${key}.[${subs}]` : key,
            ];
        }

        return result;
    }, [])
);

const populateGraphWithIds = (graph, instance) => (
    Object.entries(graph).reduce((result, [key, value]) => {
        if (isObjectWithoutId(value)
            && instance[key]
            && instance.constructor.getRelations()[key] instanceof Model.BelongsToOneRelation
        ) {
            return {
                ...result,
                [key]: {
                    id: instance[key].id,
                    ...populateGraphWithIds(value, instance[key]),
                },
            };
        }

        return { ...result, [key]: value };
    }, {})
);

export default class CustomQueryBuilder extends QueryBuilder {
    // `upsertGraph` is unable to update BelongsToOneRelations if no id is passed but a
    // representation in the database exists. This helper traverses the passed graph and adds id
    // keys to all nodes *without* ids but *with* a row in the database. If there is no row, no id
    // will be added and an insert will be performed as usual.
    // see https://github.com/Vincit/objection.js/issues/1112
    async transformGraphForBelongsToOneRelations(graph) {
        const relations = convertNodesWithoutIdToRelationExpression(graph);

        if (relations.length > 0) {
            const instance = await this.modelClass().query().findById(graph.id);
            await instance.$loadRelated(`[${relations}]`);
            return populateGraphWithIds(graph, instance);
        }

        return graph;
    }

    // @overrides super.upsertGraph
    async upsertGraph(graph, options) {
        return super.upsertGraph(
            options?.noGraphTransform
                ? graph
                : await this.transformGraphForBelongsToOneRelations(graph),
            options,
        );
    }

    // @overrides super.upsertGraphAndFetch
    async upsertGraphAndFetch(graph, options) {
        return super.upsertGraphAndFetch(
            options?.noGraphTransform
                ? graph
                : await this.transformGraphForBelongsToOneRelations(graph),
            options,
        );
    }

    filter(filter = {}, auth = {}) {
        const { filters } = this.modelClass();

        Object.entries(filter).forEach(([key, value]) => {
            filters[key](this, value, null, auth);
        });

        return this;
    }

    graphqlEager(info, additionalExpression, auth) {
        const { relationExpression, filters } = this.modelClass().infoToEager(
            info,
            additionalExpression,
            auth,
        );

        return this.withGraphFetched(relationExpression, filters);
    }

    matchesAnyRows() {
        return this.count()
            .then((counted) => {
                console.log(`counted: ${JSON.stringify(counted)}`);
                const row = Array.isArray(counted) ? counted[0] : counted;
                return row.count > 0;
            })
            .catch((reason) => {
                console.log('error while checking for matching rows: %s', reason);
                return false;
            });
    }

    paginate(pagination) {
        if (!pagination) {
            return this;
        }

        const {
            cursor,
            orderBy = 'id',
            direction = 'asc',
            limit = 10,
        } = pagination;
        const builder = this
            .orderBy(`${this.modelClass().tableName}.${orderBy}`, direction)
            .limit(limit);

        if (cursor) {
            builder.where(
                `${this.modelClass().tableName}.${orderBy}`,
                direction === 'asc' ? '>' : '<',
                cursor,
            );
        }

        return builder;
    }
}
