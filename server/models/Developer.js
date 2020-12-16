import BaseModel from './_base';

export default class Developer extends BaseModel {
    static get tableName() {
        return 'developer';
    }

    static get relationMappings() {
        return {
            games: {
                relation: BaseModel.HasManyRelation,
                modelClass: 'Game',
                join: {
                    from: 'developer.id',
                    to: 'game.developerId',
                },
            },
        };
    }
}
