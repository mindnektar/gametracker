import BaseModel from './_base';

export default class Dlc extends BaseModel {
    static get tableName() {
        return 'dlc';
    }

    static get relationMappings() {
        return {
            game: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: 'Game',
                join: {
                    from: 'dlc.gameId',
                    to: 'game.id',
                },
            },
        };
    }
}
