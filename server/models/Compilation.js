import BaseModel from './_base';

export default class Compilation extends BaseModel {
    static get tableName() {
        return 'compilation';
    }

    static get relationMappings() {
        return {
            games: {
                relation: BaseModel.HasManyRelation,
                modelClass: 'Game',
                join: {
                    from: 'compilation.id',
                    to: 'game.compilationId',
                },
            },
        };
    }
}
