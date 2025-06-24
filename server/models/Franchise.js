import BaseModel from './_base';

export default class Franchise extends BaseModel {
    static get tableName() {
        return 'franchise';
    }

    static get relationMappings() {
        return {
            games: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: 'Game',
                join: {
                    from: 'franchise.id',
                    through: {
                        from: 'game_franchise_xref.franchise_id',
                        to: 'game_franchise_xref.game_id',
                    },
                    to: 'game.id',
                },
            },
        };
    }
}
