export default {
    atmosphere: {
        label: 'Atmosphere',
        icon: 'air',
        values: {
            0: {
                label: 'Cozy',
                description: 'Warm, safe and inviting; encourages comfort and familiarity',
            },
            1: {
                label: 'Relaxed',
                description: 'Calm and easygoing, with little urgency or stress',
            },
            2: {
                label: 'Neutral',
                description: 'Emotionally even; neither calming nor intense',
            },
            3: {
                label: 'Tense',
                description: 'Builds suspense or pressure; keeps the player alert',
            },
            4: {
                label: 'Scary',
                description: 'Designed to provoke fear, dread or anxiety',
            },
        },
    },
    mood: {
        label: 'Mood',
        icon: 'mood',
        values: {
            0: {
                label: 'Whimsical',
                description: 'Quirky, imaginative or playfully absurd',
            },
            1: {
                label: 'Cheerful',
                description: 'Positive, uplifting, or hopeful in tone',
            },
            2: {
                label: 'Neutral',
                description: 'Emotionally balanced or subdued in expression',
            },
            3: {
                label: 'Somber',
                description: 'Reflective, melancholic, or quietly emotional',
            },
            4: {
                label: 'Grim',
                description: 'Bleak, serious or emotionally heavy',
            },
        },
    },
    pacing: {
        label: 'Pacing',
        icon: 'directions_run',
        values: {
            0: {
                label: 'Slow',
                description: 'Deliberate and measured, with minimal urgency',
            },
            1: {
                label: 'Steady',
                description: 'Consistent rhythm, unhurried but purposeful',
            },
            2: {
                label: 'Dynamic',
                description: 'Pacing varies with gameplay shifts or discovery',
            },
            3: {
                label: 'Fast',
                description: 'Quick and constant action or movement',
            },
            4: {
                label: 'Chaotic',
                description: 'Intentionally overwhelming or frenzied',
            },
        },
    },
    complexity: {
        label: 'Complexity',
        icon: 'psychology',
        values: {
            0: {
                label: 'Minimal',
                description: 'Extremely simple mechanics with little depth',
            },
            1: {
                label: 'Straightforward',
                description: 'Easy to understand with some nuance',
            },
            2: {
                label: 'Balanced',
                description: 'Accessible yet meaningfully layered',
            },
            3: {
                label: 'Involved',
                description: 'Requires learning and managing multiple systems',
            },
            4: {
                label: 'Deep',
                description: 'Highly complex, often with steep learning curves',
            },
        },
    },
    playerAgency: {
        label: 'Player Agency',
        icon: 'arrow_split',
        values: {
            0: {
                label: 'Fixed',
                description: 'Tightly scripted with no meaningful choices',
            },
            1: {
                label: 'Guided',
                description: 'Some freedom within a clear structure',
            },
            2: {
                label: 'Flexible',
                description: 'Allows various approaches to objectives',
            },
            3: {
                label: 'Open',
                description: 'Broad freedom over pace, paths and goals',
            },
            4: {
                label: 'Freeform',
                description: 'Unrestricted and self-directed with no set path',
            },
        },
    },
    narrativeStructure: {
        label: 'Narrative Structure',
        icon: 'book_5',
        values: {
            0: {
                label: 'Negligible',
                description: 'No story or one so minimal it has no real impact on the experience',
            },
            1: {
                label: 'Implied',
                description: 'Story hinted at through worldbuilding or environmental context',
            },
            2: {
                label: 'Linear',
                description: 'Follows a set narrative path with little deviation',
            },
            3: {
                label: 'Branching',
                description: 'Choices meaningfully alter the story\'s direction or outcome',
            },
            4: {
                label: 'Emergent',
                description: 'Story arises organically from player behavior or gameplay systems',
            },
        },
    },
    challengeFocus: {
        label: 'Challenge Focus',
        icon: 'chess',
        values: {
            0: {
                label: 'Reflexive',
                description: 'Reaction time and quick decision-making under pressure',
            },
            1: {
                label: 'Tactile',
                description: 'Fine motor control, rhythm, or physical coordination of inputs',
            },
            2: {
                label: 'Balanced',
                description: 'Even mix of phyiscal and mental challenge',
            },
            3: {
                label: 'Logical',
                description: 'Reasoning, deduction or abstract thinking',
            },
            4: {
                label: 'Strategic',
                description: 'Long-term planning, management and optimization',
            },
        },
    },
    challengeIntensity: {
        label: 'Challenge Intensity',
        icon: 'swords',
        values: {
            0: {
                label: 'Gentle',
                description: 'Minimal challenge or pressure; very forgiving',
            },
            1: {
                label: 'Easygoing',
                description: 'Light difficulty with occasional friction',
            },
            2: {
                label: 'Moderate',
                description: 'Balanced challenge for a wide audience',
            },
            3: {
                label: 'Demanding',
                description: 'Consistent, engaging difficulty requiring focus',
            },
            4: {
                label: 'Punishing',
                description: 'High stakes and difficulty, often unforgiving',
            },
        },
    },
};
