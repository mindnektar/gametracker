import BaseModel from './_base';

export default class System extends BaseModel {
    static get tableName() {
        return 'system';
    }

    static get relationMappings() {
        return {
            games: {
                relation: BaseModel.HasManyRelation,
                modelClass: 'Game',
                join: {
                    from: 'system.id',
                    to: 'game.systemId',
                },
            },
        };
    }
}
