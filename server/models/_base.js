import { v4 as uuid } from 'uuid';
import moment from 'moment';
import knex from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';
import config from '../config';
import CustomQueryBuilder from './_base/queryBuilder';
import convertGraphqlInfoToRelationExpressionAndFilters from './_base/convertGraphqlInfoToRelationExpressionAndFilters';

Model.knex(knex({
    ...config.knex,
    ...knexSnakeCaseMappers(),
}));

export default class BaseModel extends Model {
    static get modelPaths() {
        return [__dirname];
    }

    static get QueryBuilder() {
        return CustomQueryBuilder;
    }

    async $beforeInsert(context) {
        await super.$beforeInsert(context);

        this.id = this.id || uuid();
    }

    async $beforeUpdate(context) {
        await super.$beforeUpdate(context);

        this.updatedAt = moment().toISOString();
    }

    static infoToEager(info, additionalExpression, auth) {
        return convertGraphqlInfoToRelationExpressionAndFilters(
            info,
            this,
            additionalExpression,
            auth,
        );
    }

    $graphqlLoadRelated(...args) {
        const trx = typeof args[0] === 'function' ? args.shift() : undefined;
        const [info, additionalExpression, auth] = args;
        const { relationExpression, filters } = this.constructor.infoToEager(
            info,
            additionalExpression,
            auth,
        );

        return this.$loadRelated(relationExpression, filters, trx);
    }
}
