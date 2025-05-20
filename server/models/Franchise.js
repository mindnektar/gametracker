import BaseModel from './_base';

export default class Franchise extends BaseModel {
    static get tableName() {
        return 'franchise';
    }

    static get relationMappings() {
        return {
            games: {
                relation: BaseModel.HasManyRelation,
                modelClass: 'Game',
                join: {
                    from: 'franchise.id',
                    to: 'game.franchiseId',
                },
            },
        };
    }
}
