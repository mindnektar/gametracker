import BaseModel from './_base';

export default class Genre extends BaseModel {
    static get tableName() {
        return 'genre';
    }

    static get relationMappings() {
        return {
            games: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: 'Game',
                join: {
                    from: 'genre.id',
                    through: {
                        from: 'genre_game_xref.genreId',
                        to: 'genre_game_xref.gameId',
                    },
                    to: 'game.id',
                },
            },
        };
    }
}
