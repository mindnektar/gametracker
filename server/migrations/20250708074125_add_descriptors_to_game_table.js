module.exports = {
    up: async (knex) => (
        knex.schema.table('game', (table) => {
            table.tinyint('atmosphere');
            table.tinyint('mood');
            table.tinyint('pacing');
            table.tinyint('complexity');
            table.tinyint('player_agency');
            table.tinyint('narrative_structure');
            table.tinyint('challenge_focus');
            table.tinyint('challenge_intensity');
        })
    ),
    down: async (knex) => (
        knex.schema.table('game', (table) => {
            table.dropColumn('atmosphere');
            table.dropColumn('mood');
            table.dropColumn('pacing');
            table.dropColumn('complexity');
            table.dropColumn('player_agency');
            table.dropColumn('narrative_structure');
            table.dropColumn('challenge_focus');
            table.dropColumn('challenge_intensity');
        })
    ),
};
