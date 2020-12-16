import BaseModel from './_base';

export default class Game extends BaseModel {
    static get tableName() {
        return 'game';
    }

    static get relationMappings() {
        return {
            lists: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: 'List',
                join: {
                    from: 'game.id',
                    through: {
                        from: 'list_game_xref.gameId',
                        to: 'list_game_xref.listId',
                    },
                    to: 'list.id',
                },
            },
            system: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: 'System',
                join: {
                    from: 'game.systemId',
                    to: 'system.id',
                },
            },
            developer: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: 'Developer',
                join: {
                    from: 'game.developerId',
                    to: 'developer.id',
                },
            },
            compilation: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: 'Compilation',
                join: {
                    from: 'game.compilationId',
                    to: 'compilation.id',
                },
            },
            genres: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: 'Genre',
                join: {
                    from: 'game.id',
                    through: {
                        from: 'genre_game_xref.gameId',
                        to: 'genre_game_xref.genreId',
                    },
                    to: 'genre.id',
                },
            },
            dlcs: {
                relation: BaseModel.HasManyRelation,
                modelClass: 'Dlc',
                join: {
                    from: 'game.id',
                    to: 'dlc.gameId',
                },
            },
        };
    }
}
