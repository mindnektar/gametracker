import BaseModel from './_base';

export default class List extends BaseModel {
    static get tableName() {
        return 'list';
    }

    static get relationMappings() {
        return {
            games: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: 'Game',
                join: {
                    from: 'list.id',
                    through: {
                        from: 'list_game_xref.listId',
                        to: 'list_game_xref.gameId',
                    },
                    to: 'game.id',
                },
            },
        };
    }
}
